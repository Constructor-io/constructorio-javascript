/* eslint-disable object-curly-newline, no-underscore-dangle */
const qs = require('qs');
const nodeFetch = require('node-fetch');
const helpers = require('../utils/helpers');

// Create URL from supplied query (term) and parameters
function createAutocompleteUrl(query, parameters, userParameters, options) {
  const {
    apiKey,
    version,
    serviceUrl,
  } = options;
  const {
    sessionId,
    clientId,
    userId,
    segments,
    testCells,
  } = userParameters;
  let queryParams = { c: version };

  queryParams.key = apiKey;
  queryParams.i = clientId;
  queryParams.s = sessionId;

  // Validate query (term) is provided
  if (!query || typeof query !== 'string') {
    throw new Error('query is a required parameter of type string');
  }

  // Pull test cells from options
  if (testCells) {
    Object.keys(testCells).forEach((testCellKey) => {
      queryParams[`ef-${testCellKey}`] = testCells[testCellKey];
    });
  }

  // Pull user segments from options
  if (segments && segments.length) {
    queryParams.us = segments;
  }

  // Pull user id from options
  if (userId) {
    queryParams.ui = userId;
  }

  if (parameters) {
    const { numResults, resultsPerSection, filters } = parameters;

    // Pull results number from parameters
    if (numResults) {
      queryParams.num_results = numResults;
    }

    // Pull results number per section from parameters
    if (resultsPerSection) {
      Object.keys(resultsPerSection).forEach((section) => {
        queryParams[`num_results_${section}`] = resultsPerSection[section];
      });
    }

    // Pull filters from parameters
    if (filters) {
      queryParams.filters = filters;
    }
  }

  queryParams._dt = Date.now();
  queryParams = helpers.cleanParams(queryParams);

  const queryString = qs.stringify(queryParams, { indices: false });

  return `${serviceUrl}/autocomplete/${encodeURIComponent(query)}?${queryString}`;
}

/**
 * Interface to autocomplete related API calls.
 *
 * @module autocomplete
 * @inner
 * @returns {object}
 */
class Autocomplete {
  constructor(options) {
    this.options = options || {};
  }

  /**
   * Retrieve autocomplete results from API
   *
   * @function getAutocompleteResults
   * @param {object} [parameters] - Additional parameters to refine result set
   * @param {number} [parameters.numResults] - The total number of results to return
   * @param {object} [parameters.filters] - Filters used to refine search
   * @param {object} [parameters.resultsPerSection] - Number of results to return (value) per section (key)
   * @param {object} [userParameters] - Parameters relevant to the user request
   * @param {number} [userParameters.sessionId] - Session ID, utilized to personalize results
   * @param {number} [userParameters.clientId] - Client ID, utilized to personalize results
   * @param {object} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {string} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.userIp] - Origin user IP, from client
   * @param {string} [userParameters.userAgent] - Origin user agent, from client
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#autocomplete
   */
  getAutocompleteResults(query, parameters = {}, userParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const headers = {};

    try {
      requestUrl = createAutocompleteUrl(query, parameters, userParameters, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Append security token as 'x-cnstrc-token' if available
    if (this.options.securityToken && typeof this.options.securityToken === 'string') {
      headers['x-cnstrc-token'] = this.options.securityToken;
    }

    // Append user IP as 'X-Forwarded-For' if available
    if (userParameters.userIp && typeof userParameters.userIp === 'string') {
      headers['X-Forwarded-For'] = userParameters.userIp;
    }

    // Append user agent as 'User-Agent' if available
    if (userParameters.userAgent && typeof userParameters.userAgent === 'string') {
      headers['User-Agent'] = userParameters.userAgent;
    }

    return fetch(requestUrl, { headers }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => {
      if (json.sections) {
        if (json.result_id) {
          const sectionKeys = Object.keys(json.sections);

          sectionKeys.forEach((section) => {
            const sectionItems = json.sections[section];

            if (sectionItems.length) {
              // Append `result_id` to each section item
              sectionItems.forEach((item) => {
                // eslint-disable-next-line no-param-reassign
                item.result_id = json.result_id;
              });
            }
          });
        }

        return json;
      }

      throw new Error('getAutocompleteResults response data is malformed');
    });
  }
}

module.exports = Autocomplete;
