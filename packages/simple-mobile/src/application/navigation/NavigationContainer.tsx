import { ACCESS_TOKEN_KEY, AUTH_STORAGE_KEY, logout, useAccessTokenFromLocalStorage, useAuthFromLocalStorage, useAutoLogout } from '@kaidu/shared/features/authentication';
import { setAxiosDefault } from '@kaidu/shared/features/axios';
import { addListener, removeAllListener, initializeBLE } from '@kaidu/shared/features/ble-general';
import { LOCAL_CUSTOMER_KEY, clearAll, fetchAppInitializationState, setAppInitializationState } from '@kaidu/shared/features/local-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { NavigationContainer as NativeNavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import Snackbar from 'react-native-snackbar';
import SplashScreen from 'react-native-splash-screen';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import { useTheme } from '@kaidu/shared/lib/styles';
import { useSWRConfig } from 'swr';
import { iosClientId, webClientId } from '../../lib';
import { BLE_CONNECT_EVENT, BLE_DISCONNECT_EVENT } from '@kaidu/shared/features/ble-general/constants';
import { useBLEScanState } from '@kaidu/shared/domain/scanning';

/**
 * Navigation Container and perform initial steps
 */
export function NavigationContainer(props) {
  // Hooks
  const { mutate } = useSWRConfig();
  const { isAuthValid, data, } = useAuthFromLocalStorage();
  const { data: tokenObj } = useAccessTokenFromLocalStorage();
  const theme = useTheme();
  useBLEScanState();

  /**
   * check if the app is re-installed;
   * uninstall will remove the async storage, but not update the keychain
   * Google sign-in 
   */
  const handleAppInitialization = async () => {
    try {
      const isInited = await fetchAppInitializationState();
      if (!isInited) {
        // logout from Google
        GoogleSignin.revokeAccess();
        GoogleSignin.signOut();
        await clearAll();
        
        // set as initialized
        await setAppInitializationState();
      }
      // if initialized, do nothing
    } catch (error) {
      console.error('handleAppInitialization', error);
    }
    return Promise.resolve();
  };

  /**
   * Add listeners to BLE changes, show notification snackbars
   */
  const registerBLEConnectionListeners = () => {
    addListener(BLE_CONNECT_EVENT, () => {
      Snackbar.show({
        text: `BLE connected`,
        textColor: theme.colors.success,
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: theme.colors.grayscale[2],
      });
    });

    addListener(BLE_DISCONNECT_EVENT, () => {
      Snackbar.show({
        text: `BLE Disconnected`,
        textColor: theme.colors.success,
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: theme.colors.grayscale[2],
      });
    });
  };

  /**
   * check login data from async storage and perform side effects
   */
  useEffect(() => {
    console.debug(`isAuthValid in NavigationContainer: ${isAuthValid}`);

    if (isAuthValid && tokenObj && tokenObj?.token) {
      const token = tokenObj?.token;
      console.debug(`setting axios header in NavigationContainer; token: ${token}`);
      setAxiosDefault(token);
    }

    if (data && !isAuthValid) { // has auth data but the auth data is not valid
      console.debug('login expired');
      logout();
      // cleanup state & local storage
      mutate(LOCAL_CUSTOMER_KEY);
      mutate(AUTH_STORAGE_KEY);
      mutate(ACCESS_TOKEN_KEY);
    }
  }, [isAuthValid, tokenObj]);

  /**
   * Keep the splash screen visible while we fetch resources. config Google login
   */
  useEffectOnce(() => {
    //XXXDC removed
    //config login
    // GoogleSignin.configure({
    //   webClientId,
    //   iosClientId,
    //   offlineAccess: true,
    // });
    console.debug(`GoogleSignin.configure is called ***REMOVED***`);
    handleAppInitialization();

    initializeBLE().finally(() => {
      // Success code
      SplashScreen.hide();
    });

    registerBLEConnectionListeners();

    return () => {
      console.log('Running clean-up of effect on unmount');
      removeAllListener(BLE_CONNECT_EVENT);
      removeAllListener(BLE_DISCONNECT_EVENT);
    }
  });

  return (
    <NativeNavigationContainer
      {...props}
    />
  );
}
