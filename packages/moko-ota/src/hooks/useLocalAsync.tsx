import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import useSWR from 'swr';
import {DISPLAY_NAME} from '../lib/constants';
import {checkIsPowerOn, enable} from '../lib/ble-general/ble-manager';
import {asyncStorageFetcher} from '~/lib/localStorage';
import WifiManager from 'react-native-wifi-reborn';

export type LocationPermissionData = {
  text: string;
  isRequestable: boolean;
  shouldInterrupt: boolean; // should interrupt user
  isGranted: boolean;
};

/**
 * @description check & get android location permission status
 * @returns Promise<LocationPermissionData>
 */
async function checkAndroidLocationPermission(): Promise<LocationPermissionData> {
  //check if fine location permissions are granted
  const result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

  // const result = RESULTS.DENIED;
  let text = '';
  let isRequestable;
  let shouldInterrupt; // the permission result requires to interrupt user's activity, i.e. user didn't know or set the permissions
  let isGranted;

  switch (result) {
    case RESULTS.UNAVAILABLE:
      // Is the feature available on this device ?
      text = `Accessing precise location is required but not available on this device. Please use another device`;
      shouldInterrupt = true;
      isRequestable = false;
      break;
    case RESULTS.DENIED:
      // Is the permission requestable ?
      text = `${DISPLAY_NAME} requires location permission to scan Bluetooth devices. Allow it to access location?`;
      isRequestable = true;
      shouldInterrupt = true;
      break;
    case RESULTS.BLOCKED:
      text = `Permission for accessing location is blocked. ${DISPLAY_NAME} may not works properly`;
      isRequestable = false;
      shouldInterrupt = true;
      break;
    case RESULTS.LIMITED:
      text = `Permission for accessing location is limited.`;
      isRequestable = false;
      shouldInterrupt = false;
      break;
    case RESULTS.GRANTED:
      text = `Permission for accessing location is granted.`;
      isRequestable = true;
      isGranted = true;
      shouldInterrupt = false;
      break;
  }

  return {text, isRequestable, shouldInterrupt, isGranted};
}

export function useLocationPermissionCheck(shouldCheck: boolean = true) {
  // return location permission check result
  const {data, error, mutate} = useSWR(
    shouldCheck ? 'fineLocation' : null,
    checkAndroidLocationPermission,
  );

  return {
    text: data?.text,
    isRequestable: data?.isRequestable,
    shouldInterrupt: data?.shouldInterrupt,
    isGranted: data?.isGranted,
    error: error,
    isLoading: !error && !data && shouldCheck,
    mutate,
  };
}

// retrieve current BLE state, includes if BLE is accessible, if BLE is enabled
export function useBluetoothState(shouldEnable: boolean = true) {
  // if BLE is not accessible, i.e. is not power on
    // send enable request when it's required and BLE is not accessible
  const {data: isPowerOn, error: stateCheckError, mutate} = useSWR(
    'bleState',
    checkIsPowerOn,
  );
  const {data: isEnabled, error: enableError} = useSWR(
    !isPowerOn && shouldEnable ? 'enableBLE' : null,
    enable,
  );

  // if it was not accessible and the enable request is successful
  if (!isPowerOn && shouldEnable && isEnabled) {
    mutate();
  }

  return {
    isPowerOn, // is accessible
    isEnabled, // is enabled after sending the enable request
    error: stateCheckError || enableError,
  };
}

export function useAsyncStorage(key: string, shouldFetch: boolean = true) {
  const {data, error, mutate} = useSWR(shouldFetch ? key : null, () =>
    asyncStorageFetcher(key),
  );
  const isLoading = data === undefined && !error;

  return {data, error, isLoading, mutate};
}

export function useCurrentConnectedWifiSSID(shouldFetch: boolean | undefined) {
  const {data, error, mutate} = useSWR(
    shouldFetch ? 'connectedWifi' : null,
    () => WifiManager.getCurrentWifiSSID(),
  );
  // if it should not fetch, it's not loading
  const isLoading = data === undefined && !error && shouldFetch;

  return {ssid: data, error, isLoading, mutate};
}
