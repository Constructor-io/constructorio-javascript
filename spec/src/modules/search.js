/* eslint-disable no-unused-expressions, import/no-unresolved */
const jsdom = require('mocha-jsdom');
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const nodeFetch = require('node-fetch');
const ConstructorIO = require('../../../test/constructorio');
const helpers = require('../../mocha.helpers');

chai.use(chaiAsPromised);
chai.use(sinonChai);
dotenv.config();

const testApiKey = process.env.TEST_API_KEY;
const validClientId = '2b23dd74-5672-4379-878c-9182938d2710';
const validSessionId = '2';
const validOptions = { apiKey: testApiKey };

describe('ConstructorIO - Search', () => {
  const clientVersion = 'cio-mocha';
  let fetchSpy;

  jsdom({ url: 'http://localhost' });

  beforeEach(() => {
    global.CLIENT_VERSION = clientVersion;
    fetchSpy = sinon.spy(nodeFetch);
  });

  afterEach(() => {
    delete global.CLIENT_VERSION;

    fetchSpy = null;
  });

  describe('getSearchResults', () => {
    const query = 'drill';
    const section = 'Products';

    it('Should return a response with a valid query, section, and client + session identifiers', (done) => {
      const clientSessionIdentifiers = {
        clientId: validClientId,
        sessionId: validSessionId,
      };
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, { section }, { ...clientSessionIdentifiers }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.term).to.equal(query);
        expect(res.request.section).to.equal(section);
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('i');
        expect(requestedUrlParams).to.have.property('s');
        expect(requestedUrlParams).to.have.property('section').to.equal(section);
        expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
        expect(requestedUrlParams).to.have.property('_dt');
        done();
      });
    });

    it('Should return a response with a valid query, section and testCells', (done) => {
      const testCells = { foo: 'bar' };
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, { section }, { testCells }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);
        expect(requestedUrlParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);
        done();
      });
    });

    it('Should return a response with a valid query, section and segments', (done) => {
      const segments = ['foo', 'bar'];
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, { section }, { segments }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.us).to.deep.equal(segments);
        expect(requestedUrlParams).to.have.property('us').to.deep.equal(segments);
        done();
      });
    });

    it('Should return a response with a valid query, section and user id', (done) => {
      const userId = 'user-id';
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, { section }, { userId }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedUrlParams).to.have.property('ui').to.equal(userId);
        done();
      });
    });

    it('Should return a response with a valid query, section, and page', (done) => {
      const page = 1;
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, {
        section,
        page,
      }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.page).to.equal(page);
        expect(requestedUrlParams).to.have.property('page').to.equal(page.toString());
        done();
      });
    });

    it('Should return a response with a valid query, section, and resultsPerPage', (done) => {
      const resultsPerPage = 2;
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, {
        section,
        resultsPerPage,
      }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.num_results_per_page).to.equal(resultsPerPage);
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(res.response.results.length).to.equal(resultsPerPage);
        expect(requestedUrlParams).to.have.property('num_results_per_page').to.equal(resultsPerPage.toString());
        done();
      });
    });

    it('Should return a response with a valid query, section, and filters', (done) => {
      const filters = { keywords: ['battery-powered'] };
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, {
        section,
        filters,
      }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.filters).to.deep.equal(filters);
        expect(requestedUrlParams).to.have.property('filters');
        expect(requestedUrlParams.filters).to.have.property('keywords').to.equal(Object.values(filters)[0][0]);
        done();
      });
    });

    it('Should return a response with a valid query, section, and fmtOptions', (done) => {
      const fmtOptions = { groups_max_depth: 2, groups_start: 'current' };
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, {
        section,
        fmtOptions,
      }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.fmt_options).to.deep.equal(fmtOptions);
        expect(requestedUrlParams).to.have.property('fmt_options');
        expect(requestedUrlParams.fmt_options).to.have.property('groups_max_depth').to.equal(Object.values(fmtOptions)[0].toString());
        expect(requestedUrlParams.fmt_options).to.have.property('groups_start').to.equal(Object.values(fmtOptions)[1]);
        done();
      });
    });

    it('Should return a response with a valid query, section, and sortBy', (done) => {
      const sortBy = 'relevance';
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, {
        section,
        sortBy,
      }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.sort_by).to.equal(sortBy);
        expect(requestedUrlParams).to.have.property('sort_by').to.equal(sortBy);
        done();
      });
    });

    it('Should return a response with a valid query, section, and sortOrder', (done) => {
      const sortOrder = 'ascending';
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, {
        section,
        sortOrder,
      }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.sort_order).to.equal(sortOrder);
        expect(requestedUrlParams).to.have.property('sort_order').to.equal(sortOrder);
        done();
      });
    });

    it('Should return a response with a valid query, section, and user ip', (done) => {
      const userIp = '127.0.0.1';
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, { section }, { userIp }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('X-Forwarded-For').to.equal(userIp);
        done();
      });
    });

    it('Should return a response with a valid query, section, and security token', (done) => {
      const securityToken = 'cio-node-test';
      const { search } = new ConstructorIO({
        ...validOptions,
        securityToken,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, { section }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('x-cnstrc-token').to.equal(securityToken);
        done();
      });
    });

    it('Should return a response with a valid query, section, and user agent', (done) => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, { section }, { userAgent }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);
        done();
      });
    });

    it('Should return a response with a valid query, section with a result_id appended to each result', (done) => {
      const { search } = new ConstructorIO(validOptions);

      search.getSearchResults(query, { section }).then((res) => {
        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('results').to.be.an('array');
        res.response.results.forEach((result) => {
          expect(result).to.have.property('result_id').to.be.a('string').to.equal(res.result_id);
        });
        done();
      });
    });

    it('Should return a redirect rule response with a valid query and section', (done) => {
      const redirectQuery = 'rolling';
      const { search } = new ConstructorIO(validOptions);

      search.getSearchResults(redirectQuery, { section }).then((res) => {
        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('redirect');
        expect(res.response.redirect).to.have.property('matched_terms').includes(redirectQuery);
        expect(res.response.redirect).to.have.property('data');
        expect(res.response.redirect.data).to.have.property('url');
        done();
      });
    });

    it('Should be rejected when invalid query is provided', () => {
      const { search } = new ConstructorIO(validOptions);

      return expect(search.getSearchResults([], { section })).to.eventually.be.rejected;
    });

    it('Should be rejected when no query is provided', () => {
      const { search } = new ConstructorIO(validOptions);

      return expect(search.getSearchResults(null, { section })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid page parameter is provided', () => {
      const { search } = new ConstructorIO(validOptions);
      const searchParams = {
        section,
        page: 'abc',
      };

      return expect(search.getSearchResults(query, searchParams)).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid resultsPerPage parameter is provided', () => {
      const { search } = new ConstructorIO(validOptions);
      const searchParams = {
        section,
        resultsPerPage: 'abc',
      };

      return expect(search.getSearchResults(query, searchParams)).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid filters parameter is provided', () => {
      const { search } = new ConstructorIO(validOptions);
      const searchParams = {
        section,
        filters: 'abc',
      };

      return expect(search.getSearchResults(query, searchParams)).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid sortBy parameter is provided', () => {
      const { search } = new ConstructorIO(validOptions);
      const searchParams = {
        section,
        sortBy: ['foo', 'bar'],
      };

      return expect(search.getSearchResults(query, searchParams)).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid sortOrder parameter is provided', () => {
      const { search } = new ConstructorIO(validOptions);
      const searchParams = {
        section,
        sortOrder: 123,
      };

      return expect(search.getSearchResults(query, searchParams)).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid section parameter is provided', () => {
      const { search } = new ConstructorIO(validOptions);

      return expect(search.getSearchResults(query, { section: 123 })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid apiKey is provided', () => {
      const { search } = new ConstructorIO({ ...validOptions, apiKey: 'fyzs7tfF8L161VoAXQ8u' });

      return expect(search.getSearchResults(query, { section })).to.eventually.be.rejected;
    });
  });
});
