/**
 * Redirects reducer.
 * @module reducers/redirects
 */

import {
  GET_REDIRECTS,
  ADD_REDIRECTS,
  REMOVE_REDIRECTS,
  GET_REDIRECTS_STATISTICS,
} from '../constants/ActionTypes';

const initialState = {
  add: {
    loaded: false,
    loading: false,
    error: null,
  },
  remove: {
    loaded: false,
    loading: false,
    error: null,
  },
  get: {
    loaded: false,
    loading: false,
    error: null,
  },
  getstatistics: {
    loaded: false,
    loading: false,
    error: null,
  },
  items: [],
  items_total: 0,
  statistics: null,
};

/**
 * Get request key
 * @function getRequestKey
 * @param {string} actionType Action type.
 * @returns {string} Request key.
 */
function getRequestKey(actionType) {
  return actionType.split('_')[0].toLowerCase();
}

/**
 * Redirects reducer.
 * @function redirects
 * @param {Object} state Current state.
 * @param {Object} action Action to be handled.
 * @returns {Object} New state.
 */
export default function redirects(state = initialState, action = {}) {
  switch (action.type) {
    case `${ADD_REDIRECTS}_PENDING`:
    case `${GET_REDIRECTS}_PENDING`:
    case `${REMOVE_REDIRECTS}_PENDING`:
      return {
        ...state,
        [getRequestKey(action.type)]: {
          loading: true,
          loaded: false,
          error: null,
        },
      };
    case `${GET_REDIRECTS_STATISTICS}_PENDING`:
      return {
        ...state,
        statistics: null,  // Clear old statistics when new request starts
        [getRequestKey(action.type)]: {
          loading: true,
          loaded: false,
          error: null,
        },
      };
    case `${GET_REDIRECTS}_SUCCESS`:
      return {
        ...state,
        items: action.result?.items || [],
        items_total: action.result?.items_total || 0,
        [getRequestKey(action.type)]: {
          loading: false,
          loaded: true,
          error: null,
        },
      };
    case `${GET_REDIRECTS_STATISTICS}_SUCCESS`:
      return {
        ...state,
        statistics: action.result?.statistics || null,
        [getRequestKey(action.type)]: {
          loading: false,
          loaded: true,
          error: null,
        },
      };
    case `${ADD_REDIRECTS}_SUCCESS`:
    case `${REMOVE_REDIRECTS}_SUCCESS`:
      return {
        ...state,
        [getRequestKey(action.type)]: {
          loading: false,
          loaded: true,
          error: action.result?.failed,
        },
      };
    case `${GET_REDIRECTS}_FAIL`:
    case `${ADD_REDIRECTS}_FAIL`:
    case `${REMOVE_REDIRECTS}_FAIL`:
    case `${GET_REDIRECTS_STATISTICS}_FAIL`:
      return {
        ...state,
        [getRequestKey(action.type)]: {
          loading: false,
          loaded: false,
          error: action.error,
        },
      };
    default:
      return state;
  }
}
