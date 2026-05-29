import applyConfig from './index';
import redirectsReducer from './reducers/redirects';
import Redirects from './components/Controlpanels/Redirects';
import GoneView from './components/GoneView';

jest.mock('./components/Controlpanels/Redirects', () => 'Redirects');
jest.mock('./components/GoneView', () => 'GoneView');

describe('volto-redirector config', () => {
  it('registers reducer, control panel route, and 410 view', () => {
    const config = {
      addonReducers: {
        existing: jest.fn(),
      },
      addonRoutes: [
        {
          path: '/existing',
          component: 'Existing',
        },
      ],
      views: {
        errorViews: {
          404: 'NotFound',
        },
      },
    };

    const result = applyConfig(config);

    expect(result.addonReducers).toEqual({
      existing: config.addonReducers.existing,
      redirects: redirectsReducer,
    });
    expect(result.addonRoutes).toEqual([
      {
        path: '/existing',
        component: 'Existing',
      },
      {
        path: '/controlpanel/eea-redirects',
        component: Redirects,
      },
    ]);
    expect(result.views.errorViews).toEqual({
      404: 'NotFound',
      410: GoneView,
    });
  });

  it('works when no existing reducers or routes are configured', () => {
    const result = applyConfig({
      views: {},
    });

    expect(result.addonReducers.redirects).toBe(redirectsReducer);
    expect(result.addonRoutes).toEqual([
      {
        path: '/controlpanel/eea-redirects',
        component: Redirects,
      },
    ]);
    expect(result.views.errorViews[410]).toBe(GoneView);
  });
});
