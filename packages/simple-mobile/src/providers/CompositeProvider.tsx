/**
 * 
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { SWRConfigProvider } from '@kaidu/shared/providers/swr';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store from './redux/store';
import { Theme } from './style';
import { ReactNativeErrorHandler } from '@kaidu/shared/domain/error-handling/components/ReactNativeErrorHandler';

/**
 * All provider components
 */
export function CompositeProvider({ children, ...optionals }) {

  return (
    <SafeAreaProvider>
      <ReactNativeErrorHandler>
        <ReduxProvider store={store}>
          <Theme>
            <SWRConfigProvider>
              {children}
            </SWRConfigProvider>
          </Theme>
        </ReduxProvider>
      </ReactNativeErrorHandler>
    </SafeAreaProvider>
  );
}
