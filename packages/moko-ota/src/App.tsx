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

  return (
    <CompositeProvider>
      <NavigationContainer testID="app-root" accessibilityLabel="app-root">
        <DrawerNavigation />
      </NavigationContainer>
    </CompositeProvider>
  );
}

export default Sentry.wrap(App);
