import {
  addRedirects,
  getRedirects,
  getRedirectsStatistics,
  importRedirects,
  removeRedirects,
} from './redirects';
import {
  ADD_REDIRECTS,
  GET_REDIRECTS,
  GET_REDIRECTS_STATISTICS,
  IMPORT_REDIRECTS,
  REMOVE_REDIRECTS,
} from '../constants/ActionTypes';

describe('redirect actions', () => {
  it('builds a get redirects request with defaults', () => {
    expect(getRedirects('/site')).toEqual({
      type: GET_REDIRECTS,
      request: {
        op: 'get',
        path: '/site/@redirects?q=&b_size=25&b_start=0&search_scope=old_url',
      },
    });
  });

  it('builds a get redirects request with options', () => {
    expect(
      getRedirects('/site', {
        query: 'climate',
        batchSize: 50,
        batchStart: 100,
        searchScope: 'new_url',
      }),
    ).toEqual({
      type: GET_REDIRECTS,
      request: {
        op: 'get',
        path: '/site/@redirects?q=climate&b_size=50&b_start=100&search_scope=new_url',
      },
    });
  });

  it('builds a get redirects statistics request', () => {
    expect(getRedirectsStatistics('/site', { query: 'gone' })).toEqual({
      type: GET_REDIRECTS_STATISTICS,
      request: {
        op: 'get',
        path: '/site/@redirects-statistics?q=gone',
      },
    });
  });

  it('builds add and remove requests', () => {
    const data = { old_path: '/old', new_path: '/new' };

    expect(addRedirects('/site', data)).toEqual({
      type: ADD_REDIRECTS,
      request: {
        op: 'post',
        path: '/site/@redirects',
        data,
      },
    });

    expect(removeRedirects('/site', data)).toEqual({
      type: REMOVE_REDIRECTS,
      request: {
        op: 'del',
        path: '/site/@redirects',
        data,
      },
    });
  });

  it('builds an import redirects request with FormData', () => {
    const OriginalFormData = global.FormData;
    const append = jest.fn();
    class MockFormData {
      append = append;
    }
    global.FormData = MockFormData;

    const file = { name: 'redirects-test.csv' };
    const action = importRedirects('/site', file);

    expect(action.type).toBe(IMPORT_REDIRECTS);
    expect(action.request.op).toBe('post');
    expect(action.request.path).toBe('/site/@redirects-import');
    expect(action.request.data).toBeInstanceOf(MockFormData);
    expect(append).toHaveBeenCalledWith('file', file, 'redirects-test.csv');

    global.FormData = OriginalFormData;
  });
});
