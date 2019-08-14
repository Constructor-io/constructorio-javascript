/* eslint-disable prefer-destructuring, no-unused-expressions */

const expect = require('chai').expect;
const Constructorio = require('../lib/constructorio');

const testConfig = {
  apiToken: 'YSOxV00F0Kk2R0KnPQN8',
  apiKey: 'ZqXaOfXuBWD4s3XzCI1q',
};

describe('ConstructorIO - Search', () => {
  const personalizationParameters = {
    s: 1,
    i: 'user',
  };

  describe('getSearchResults', () => {
    it('should return search results when supplying a valid query and section', (done) => {
      const constructorio = new Constructorio(testConfig);
      const query = 'drill';

      constructorio.getSearchResults({
        query,
        section: 'Products',
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('request').that.is.an('object');
        expect(response).to.have.property('response').that.is.an('object');
        expect(response).to.have.property('result_id').that.is.a('string');
        expect(response.request).to.have.property('term').that.is.a('string', query);
        expect(response.response).to.have.property('facets').that.is.an('array');
        expect(response.response).to.have.property('features').that.is.an('array');
        expect(response.response).to.have.property('groups').that.is.an('array');
        expect(response.response).to.have.property('results').that.is.an('array').length.to.be.above(0);
        expect(response.response).to.have.property('sort_options').that.is.an('array');
        done();
      });
    });

    it('should return no search results when supplying a non-matching query', (done) => {
      const constructorio = new Constructorio(testConfig);
      const query = 'xylophone';

      constructorio.getSearchResults({
        query,
        section: 'Products',
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.response).to.have.property('results').that.is.an('array').length(0);
        done();
      });
    });

    it('should return error when retrieving search results with invalid section', (done) => {
      const constructorio = new Constructorio(testConfig);
      const query = 'xylophone';

      constructorio.getSearchResults({
        query,
        section: 'invalid',
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'Unknown section: invalid');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return one search result when specifying a num results per page parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        num_results_per_page: 1,
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.response).to.have.property('results').that.is.an('array').length(1);
        done();
      });
    });

    it('should return error when retrieving search results with invalid num results per page parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        num_results_per_page: 'abc',
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'num_results_per_page must be an integer');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return search results when specifying a valid page parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        page: 1,
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.response).to.have.property('results').that.is.an('array').length.to.be.above(0);
        done();
      });
    });

    it('should return error when retrieving search results with invalid page parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        page: 'abc',
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'page must be an integer');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return search results when supplying valid num results per page and page combination', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        num_results_per_page: 5,
        page: 1,
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.response).to.have.property('results').that.is.an('array').length(5);
        done();
      });
    });

    it('should return no results when supplying invalid num results per page and page combination', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        num_results_per_page: 99,
        page: 99,
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.response).to.have.property('results').that.is.an('array').length(0);
        done();
      });
    });

    it('should return search result set with filters applied when specifying a valid filters parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        'filters[keywords]': 'battery-powered',
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.request.filters).to.have.property('keywords').that.is.an('array').length(1);
        expect(response.response.facets).to.be.an('array').length(1);
        done();
      });
    });

    it('should return search result set with filters applied when specifying multiple valid filters parameters', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        'filters[keywords]': 'battery-powered',
        'filters[Price]': '10-20',
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.request.filters).to.have.property('keywords').that.is.an('array').length(1);
        expect(response.request.filters).to.have.property('Price').that.is.an('array').length(1);
        expect(response.response.facets).to.be.an('array').length(2);
        done();
      });
    });

    it('should return error when retrieving search results with invalid filters parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        'filters[keywords]': '',
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'filters.keywords must contain at least 1 element(s)');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return search result set when valid fmt options start parameter is supplied', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        'fmt_options[groups_start]': 'current',
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.response).to.have.property('results').that.is.an('array').length.to.be.above(0);
        done();
      });
    });

    it('should return error when retrieving search results when invalid fmt options parameter is supplied', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        'fmt_options[invalid]': 'current',
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'Unknown format option: invalid. Keys of fmt_options must be one of (groups_max_depth, groups_start)');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return search results when invalid fmt options start parameter is supplied', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        'fmt_options[groups_start]': 'invalid',
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'Invalid value for parameter: "fmt_options.groups_start"');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return search results when valid fmt options max depth parameter is supplied', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        'fmt_options[groups_max_depth]': 1,
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.response).to.have.property('results').that.is.an('array').length.to.be.above(0);
        done();
      });
    });

    it('should return error when retrieving search results when invalid fmt options start parameter is supplied', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        'fmt_options[groups_max_depth]': 'invalid',
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'fmt_options.groups_max_depth must be an integer');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return search results when valid sort by parameter is supplied', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        sort_by: 'relevance',
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.response).to.have.property('results').that.is.an('array').length.to.be.above(0);
        done();
      });
    });

    it('should return search results when valid sort order parameter is supplied', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        sort_order: 'ascending',
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.response).to.have.property('results').that.is.an('array').length.to.be.above(0);
        done();
      });
    });

    it('should return search results when valid sort order and sort by parameters are supplied', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        sort_by: 'relevance',
        sort_order: 'ascending',
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.response).to.have.property('results').that.is.an('array').length.to.be.above(0);
        done();
      });
    });

    it('should return error when retrieving search results when invalid sort order parameter is supplied', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        sort_order: 'invalid',
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'Invalid value for parameter: "sort_order"');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when retrieving search results when non-existent collection id is supplied', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
        section: 'Products',
        collection_id: 1,
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'Collection with id "1" not found.');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when invalid personalization parameters are supplied', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSearchResults({
        query: 'drill',
      }, {
        s: 'abc',
        i: 0,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'Request could not be completed - `s` and `i` are required parameters and must be a number and string, respectively');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when retrieving search results with an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.getSearchResults({
        query: 'drill',
      }, personalizationParameters, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/We have no record of this key./);
        expect(response).to.be.undefined;
        done();
      });
    });
  });
});
