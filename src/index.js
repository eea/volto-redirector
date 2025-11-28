/**
 * Volto Redirector addon configuration
 * @module volto-redirector
 */

import redirectsReducer from './reducers/redirects';
import Redirects from './components/Controlpanels/Redirects';
import GoneView from './components/GoneView';

const applyConfig = (config) => {
  // Add redirects reducer
  config.addonReducers = {
    ...config.addonReducers,
    redirects: redirectsReducer,
  };

  // Add route for the redirects controlpanel
  // The controlpanel is automatically discovered from the backend via @controlpanels endpoint
  // We only need to register the custom component route here
  config.addonRoutes = [
    ...(config.addonRoutes || []),
    {
      path: '/controlpanel/eea-redirects',
      component: Redirects,
    },
  ];

  // Register custom 410 Gone view
  config.views = {
    ...config.views,
    errorViews: {
      ...config.views.errorViews,
      410: GoneView,
    },
  };

  return config;
};

export default applyConfig;
