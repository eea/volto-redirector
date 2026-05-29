import redirects from './redirects';
import {
  ADD_REDIRECTS,
  GET_REDIRECTS,
  GET_REDIRECTS_STATISTICS,
  IMPORT_REDIRECTS,
  REMOVE_REDIRECTS,
} from '../constants/ActionTypes';

describe('redirects reducer', () => {
  it('returns the initial state', () => {
    expect(redirects(undefined, {})).toMatchObject({
      add: { loaded: false, loading: false, error: null },
      remove: { loaded: false, loading: false, error: null },
      get: { loaded: false, loading: false, error: null },
      getstatistics: { loaded: false, loading: false, error: null },
      import: { loaded: false, loading: false, error: null, result: null },
      items: [],
      items_total: 0,
      statistics: null,
    });
  });

  it('handles pending states', () => {
    expect(
      redirects(undefined, { type: `${GET_REDIRECTS}_PENDING` }).get,
    ).toEqual({
      loading: true,
      loaded: false,
      error: null,
      result: null,
    });

    expect(
      redirects(undefined, { type: `${IMPORT_REDIRECTS}_PENDING` }).import,
    ).toEqual({
      loading: true,
      loaded: false,
      error: null,
      result: null,
    });
  });

  it('clears statistics when statistics loading starts', () => {
    const state = redirects(
      {
        statistics: { total: 3 },
      },
      { type: `${GET_REDIRECTS_STATISTICS}_PENDING` },
    );

    expect(state.statistics).toBeNull();
    expect(state.getstatistics).toEqual({
      loading: true,
      loaded: false,
      error: null,
    });
  });

  it('stores redirects from successful get responses', () => {
    const state = redirects(undefined, {
      type: `${GET_REDIRECTS}_SUCCESS`,
      result: {
        items: [{ old_path: '/old' }],
        items_total: 1,
      },
    });

    expect(state.items).toEqual([{ old_path: '/old' }]);
    expect(state.items_total).toBe(1);
    expect(state.get).toEqual({
      loading: false,
      loaded: true,
      error: null,
    });
  });

  it('uses fallback values for empty successful get responses', () => {
    const state = redirects(undefined, {
      type: `${GET_REDIRECTS}_SUCCESS`,
      result: undefined,
    });

    expect(state.items).toEqual([]);
    expect(state.items_total).toBe(0);
  });

  it('stores statistics from successful statistics responses', () => {
    const state = redirects(undefined, {
      type: `${GET_REDIRECTS_STATISTICS}_SUCCESS`,
      result: {
        statistics: { total: 5, gone: 2 },
      },
    });

    expect(state.statistics).toEqual({ total: 5, gone: 2 });
    expect(state.getstatistics.loaded).toBe(true);
  });

  it('handles add, remove, and import success states', () => {
    expect(
      redirects(undefined, {
        type: `${ADD_REDIRECTS}_SUCCESS`,
        result: { failed: ['duplicate'] },
      }).add,
    ).toEqual({
      loading: false,
      loaded: true,
      error: ['duplicate'],
    });

    expect(
      redirects(undefined, {
        type: `${REMOVE_REDIRECTS}_SUCCESS`,
        result: {},
      }).remove,
    ).toEqual({
      loading: false,
      loaded: true,
      error: undefined,
    });

    expect(
      redirects(undefined, {
        type: `${IMPORT_REDIRECTS}_SUCCESS`,
        result: { imported: 3 },
      }).import,
    ).toEqual({
      loading: false,
      loaded: true,
      error: undefined,
      result: { imported: 3 },
    });
  });

  it('handles request failures', () => {
    const error = { message: 'Nope' };
    const state = redirects(undefined, {
      type: `${REMOVE_REDIRECTS}_FAIL`,
      error,
    });

    expect(state.remove).toEqual({
      loading: false,
      loaded: false,
      error,
    });
  });
});
