import { initializeBLE } from '@kaidu/shared/features/ble-general';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import {
  useCurrentConnectedWifiSSID,
  useLocationPermissionCheck
} from '~/hooks/useLocalAsync';
import { AndroidMokoModule } from '~/lib/NativeModules';
import { selecthasWiFiSsid, updateGlobalWiFi } from '~/lib/redux/wifiSlice';
import ActivityIndicator from '../components/atomic/ActivityIndicator';
import { useBLEScanState } from '@kaidu/shared/domain/scanning';

// console.debug(Platform.OS);
const MokoModule = AndroidMokoModule;

export default function MyNavigationContainer(props) {
  // Hooks
  const { isGranted } = useLocationPermissionCheck();
  useBLEScanState();

  // Global state
  const hasSsid = useSelector(selecthasWiFiSsid);

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
  });

  // handle errors
  if (isConnectedWifiError) {
    const error = isConnectedWifiError;
    console.error(error?.message);
    // Alert.alert(error?.name, error?.message);
  }
  if (isConnectedWifiError) {
    console.error(`Cannot get current SSID.`);
    console.error(`${isConnectedWifiError?.message}`);
  }
  // handle loading
  if (isLoadingConnectedWifi) {
    // return <ActivityIndicator text={'Loading init data...'} />;
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
