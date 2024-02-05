import React from 'react';
import { SWRConfigProvider } from '@kaidu/shared/providers/swr';
import { Theme } from '@kaidu/shared/providers/style';
import store from '../lib/redux/store';
import { Provider as ReduxProvider } from 'react-redux';

export function CompositeProvider({ children, ...optionals }) {
  return (
    <ReduxProvider store={store}>
      <Theme>
        <SWRConfigProvider>{children}</SWRConfigProvider>
      </Theme>
    </ReduxProvider>
  );
}
