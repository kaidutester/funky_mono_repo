import { ENV_NAME } from '@env';
import * as Sentry from '@sentry/react-native';
import React from 'react';
import { NavigationContainer, DrawerItemGroup } from './navigation';
import { DrawerNavigation } from './navigation/DrawerNavigation';
import { CompositeProvider } from '../providers/CompositeProvider';
import { initMonitoring } from '../lib/services/monitor';

try {
  if (ENV_NAME?.includes('/dev') || ENV_NAME?.includes('/test')) {
  } else {
    initMonitoring();
  }
} catch (error) {
  console.error(error);
}

/**
 * All consumer components
 */
function Consumers() {
  return (
    <NavigationContainer testID="app-root" accessibilityLabel="app-root">
      {/* <StackNavigation /> */}
      <DrawerNavigation
        drawerContent={props => <DrawerItemGroup {...props} />}
      />
    </NavigationContainer>
  );
}

/**
 *
 */
function App() {
  return (
    <CompositeProvider>
      <Consumers />
    </CompositeProvider>
  );
}

export default Sentry.wrap(App);
