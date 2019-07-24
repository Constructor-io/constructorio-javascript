/* eslint-disable prefer-destructuring, no-unused-expressions */

const expect = require('chai').expect;
const deepfreeze = require('deepfreeze');
const uuidv1 = require('uuid/v1');
const Constructorio = require('../lib/constructorio');

const testConfig = {
  apiToken: 'YSOxV00F0Kk2R0KnPQN8',
  apiKey: 'ZqXaOfXuBWD4s3XzCI1q',
};

// Helper method - create synonym group with random synonyms
function addTestSynonymGroup() {
  const constructorio = new Constructorio(testConfig);

  return new Promise((resolve, reject) => {
    constructorio.addSynonymGroup({
      synonyms: [
        `${Math.random().toString(36).substring(2, 15)}`,
        `${Math.random().toString(36).substring(2, 15)}`
      ]
    }, (err, response) => {
      if (err) {
        return reject(err);
      }

      return resolve(response);
    });
  });
}

// Helper method - remove synonym group for specified id
function removeTestSynonymGroup(id) {
  const constructorio = new Constructorio(testConfig);

  return new Promise((resolve, reject) => {
    constructorio.removeSynonymGroup({
      group_id: id
    }, (err, response) => {
      if (err) {
        return reject(err);
      }

      return resolve(response);
    });
  });
}

describe('ConstructorIO - Synonym Groups', () => {
  describe('addSynonymGroup', () => {
    let addedSynonymGroupId = null;

    after((done) => {
      // Clean up - remove synonym group created by test
      removeTestSynonymGroup(addedSynonymGroupId).then(() => {
        done();
      }).catch((err) => {
        console.warn('Created test synonym group within `addSynonymGroup` could not be removed');
        console.warn(err);
        done();
      });
    });

    it('should return a group id when adding a group with synonyms', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addSynonymGroup({
        synonyms: ['0% milk', 'skim milk', 'nonfat milk']
      }, (err, response) => {
        addedSynonymGroupId = response.group_id;

        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('group_id').that.is.a('number');
        done();
      });
    });

    it('should return an error when adding a group with the same synonyms', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addSynonymGroup({
        synonyms: ['0% milk', 'skim milk', 'nonfat milk']
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'An identical or superset synonym group already exists.');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error id when adding a group with no synonyms', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addSynonymGroup({
        synonyms: []
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'This method requires at least one synonym passed in JSON. See the docs for more details.');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error id when adding a group with synonyms of incorrect type', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addSynonymGroup({
        synonyms: 'abc'
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'You must supply the "synonyms" parameter, and it must be of type "array".');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error id when adding a group without synonyms property', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addSynonymGroup({}, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'You must supply the "synonyms" parameter, and it must be of type "array".');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when adding a group with an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.addSynonymGroup({
        synonyms: ['0% milk', 'skim milk', 'nonfat milk']
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('removeSynonymGroup', () => {
    let addedSynonymGroupId = null;

    before((done) => {
      // Create test synonym group for use in tests
      addTestSynonymGroup().then((response) => {
        addedSynonymGroupId = response.group_id
        done();
      }).catch((err) => {
        console.warn('Test synonym group within `removeSynonymGroup` could not be created');
        console.warn(err);
        done();
      });
    });

    it('should remove a group when supplying a valid group id', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.removeSynonymGroup({
        group_id: addedSynonymGroupId
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('message', '');
        done();
      });
    });

    it('should return an error when supplying a valid group id that has already been removed', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.removeSynonymGroup({
        group_id: addedSynonymGroupId
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'There is no synonym group with this id associated with your autocomplete_key');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when supplying an invalid group id', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.removeSynonymGroup({
        group_id: 1
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'There is no synonym group with this id associated with your autocomplete_key');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when supplying a group id of invalid type', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.removeSynonymGroup({
        group_id: 'abc'
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'There is no synonym group with this id associated with your autocomplete_key');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when not supplying a group id', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.removeSynonymGroup({}, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'There is no synonym group with this id associated with your autocomplete_key');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when adding a group with an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.removeSynonymGroup({
        group_id: addedSynonymGroupId
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });
});