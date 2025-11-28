/**
 * Redirects actions.
 * @module actions/redirects
 */

import {
  GET_REDIRECTS,
  ADD_REDIRECTS,
  REMOVE_REDIRECTS,
  GET_REDIRECTS_STATISTICS,
} from '../constants/ActionTypes';

/**
 * Get redirects function.
 * @function getRedirects
 * @param {string} url Content url (usually site root).
 * @param {Object} options Options data.
 * @returns {Object} Get redirects action.
 */
export function getRedirects(url, options) {
  const { query, batchSize, batchStart, searchScope } = options || {};
  return {
    type: GET_REDIRECTS,
    request: {
      op: 'get',
      path: `${url}/@redirects?q=${query || ''}&b_size=${
        batchSize || 25
      }&b_start=${batchStart || 0}&search_scope=${searchScope || 'old_url'}`,
    },
  };
}

/**
 * Get redirects statistics function.
 * @function getRedirectsStatistics
 * @param {string} url Content url (usually site root).
 * @param {Object} options Options data.
 * @returns {Object} Get redirects statistics action.
 */
export function getRedirectsStatistics(url, options) {
  const { query } = options || {};
  return {
    type: GET_REDIRECTS_STATISTICS,
    request: {
      op: 'get',
      path: `${url}/@redirects-statistics?q=${query || ''}`,
    },
  };
}

/**
 * Add redirect function.
 * @function addRedirects
 * @param {string} url Content url (usually site root).
 * @param {Object} data Redirects to add data object.
 * @returns {Object} Add redirect action.
 */
export function addRedirects(url, data) {
  return {
    type: ADD_REDIRECTS,
    request: {
      op: 'post',
      path: `${url}/@redirects`,
      data,
    },
  };
}

/**
 * Remove redirects function.
 * @function removeRedirects
 * @param {string} url Content url (usually site root).
 * @param {Object} data Redirects to remove data object.
 * @returns {Object} Remove redirect action.
 */
export function removeRedirects(url, data) {
  return {
    type: REMOVE_REDIRECTS,
    request: {
      op: 'del',
      path: `${url}/@redirects`,
      data,
    },
  };
}
