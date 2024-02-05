import React from 'react';
import * as Sentry from "@sentry/react-native";
import DrawerNavigation from './navigation/DrawerNavigation';
import { version } from '../package.json';
import NavigationContainer from './navigation/NavigationContainer';
import { CompositeProvider } from './providers';

/**
 * Use NavigationContainer to load init data
 */
function App() {
  console.debug('App version: ' + version);
  // const persistor = persistStore(store);

  Sentry.init({
    dsn: "https://fecb610182df42bc9586019700c767fb@o1143758.ingest.sentry.io/6242918",
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production.
    tracesSampleRate: 1.0,
  });

  return (
    <CompositeProvider>
      <NavigationContainer testID="app-root" accessibilityLabel="app-root">
        <DrawerNavigation />
      </NavigationContainer>
    </CompositeProvider>
  );
}

export default Sentry.wrap(App);
