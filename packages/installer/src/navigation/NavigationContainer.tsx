import { ACCESS_TOKEN_KEY, AUTH_STORAGE_KEY, logout, useAccessTokenFromLocalStorage, useAuthFromLocalStorage } from '@kaidu/shared/features/authentication';
import { setAxiosDefault } from '@kaidu/shared/features/axios';
import { initializeBLE } from '@kaidu/shared/features/ble-general';
import { useLatestFirmwareVersionFilesubpath } from '@kaidu/shared/features/kaidu-server/kaidu-firmware-list';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import { useSWRConfig } from 'swr';
import { useCurrentConnectedWifiSSID } from '@kaidu/shared/features/wifi';
import { useLocationPermissionCheck } from '@kaidu/shared/domain/permission';
import { useAsyncStorage } from '@kaidu/shared/features/local-storage';
import { AndroidMokoModule } from '~/lib/NativeModules';
import { iosClientId, webClientId } from '~/features/authentication';
import { isNumericDatePassed } from '@kaidu/shared/features/date';
import { asyncStorageFetcher, removeItem } from '@kaidu/shared/features/local-storage';
import { selecthasWiFiSsid, updateGlobalWiFi } from '~/lib/redux/wifiSlice';
import { inspect } from '@kaidu/shared/utils';
import ActivityIndicator from '../components/atomic/ActivityIndicator';
import { updateFirmwareFilePath } from '../features/moko/providers/mokoSlice';
import { useBLEScanState } from '@kaidu/shared/domain/scanning';

// console.debug(Platform.OS);
const MokoModule = AndroidMokoModule;

/**
 * 
 */
export default function MyNavigationContainer(props) {
  // Hooks
  const { data: tokenObj } = useAsyncStorage(ACCESS_TOKEN_KEY);
  const {
    latest,
    isLoading: isLoadingLatestFirmwareVersionName,
    isError,
  } = useLatestFirmwareVersionFilesubpath();
  const { isGranted } = useLocationPermissionCheck();

  const { mutate } = useSWRConfig();
  useBLEScanState();

  // Global state
  const hasSsid = useSelector(selecthasWiFiSsid);
  const { isAuthValid } = useAuthFromLocalStorage();
  const isLoggedIn = isAuthValid;

  //conditional hook
  const {
    ssid,
    error: isConnectedWifiError,
    isLoading: isLoadingConnectedWifi,
  } = useCurrentConnectedWifiSSID(isGranted); //fetch connected ssid when location permission is granted
  const dispatch = useDispatch();

  useEffectOnce(() => {
    initializeBLE().then(() => {
      // Success code
      console.debug("BLE Manager Module initialized");
    });

    // init native modules
    if (Platform.OS === 'android') {
      MokoModule.init();
    }

    //XXXDC removed
    //config login
    // GoogleSignin.configure({
    //   webClientId,
    //   iosClientId,
    // });
    console.debug(`GoogleSignin.configure is called **REMOVED**`);

    // check login data from local storage
    asyncStorageFetcher(AUTH_STORAGE_KEY).then(async loginData => {
      console.debug(`loginData in local storage: ${inspect(loginData)}`);
      // update global state if it's valid
      if (loginData && !isLoggedIn) {
        // const isValid = !isNumericDatePassed(1516239022);
        const isValid = !isNumericDatePassed(loginData?.exp);
        if (isValid) {
          console.debug(`login is valid`);
        } else {
          // cleanup state & local storage
          await removeItem(AUTH_STORAGE_KEY);
          mutate(AUTH_STORAGE_KEY);
          await removeItem(ACCESS_TOKEN_KEY);
          mutate(ACCESS_TOKEN_KEY);
        }
      }
    });
  });

  // handle errors
  if (isError || isConnectedWifiError) {
    const error = isError || isConnectedWifiError;
    console.error(error?.message);
    // Alert.alert(error?.name, error?.message);
  }
  if (isConnectedWifiError) {
    console.error(`Cannot get current SSID.`);
    console.error(`${isConnectedWifiError?.message}`);
  }
  // handle loading
  if (isLoadingLatestFirmwareVersionName || isLoadingConnectedWifi) {
    isLoadingLatestFirmwareVersionName && console.debug(`isLoadingLatestFirmwareVersionName`);
    // return <ActivityIndicator text={'Loading init data...'} />;
  }

  // handle data
  if (tokenObj && tokenObj?.token) {
    const token = tokenObj?.token;
    setAxiosDefault(token);
  }
  if (latest) {
    console.debug('dispatch latest firmware version ', latest);

    dispatch(updateFirmwareFilePath(`/${latest}`));
  }
  if (ssid) {
    console.debug('Your current connected wifi SSID is ' + ssid);
    if (!hasSsid) {
      console.debug(`No SSID in global state. Dispatch ${ssid} to global SSID`);
      dispatch(updateGlobalWiFi({ ssid, password: '' }));
    }
  }

  return (
    <NavigationContainer
      fallback={<ActivityIndicator />}
      {...props}
    />
  );
}
