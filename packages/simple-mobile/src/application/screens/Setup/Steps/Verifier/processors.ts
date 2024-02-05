import {
  ScannedDeviceFromBLEManager,
  scanBLE,
  stopScanning,
} from '@kaidu/shared/features/ble-general';
import {
  PlugState,
  checkIsConnectionError,
  checkIsKaiduPlugState,
  getPlugStateFromScannedDevice,
} from '@kaidu/shared/features/ble-kaidu';
import { fetchConfigurationByMACWithMultiTries } from '@kaidu/shared/features/kaidu-server/kaidu-device-configuration';
import { fetchConfigurationByMAC } from '@kaidu/shared/features/kaidu-server/kaidu-device-configuration';
import {Wifi} from '@kaidu/shared/features/wifi';
import {generateErrorFromPlugState} from '@kaidu/shared/domain/error-handling';

const VERIFICATION_TIME = 60; // seconds

/**
 * @description if wifi is matched, return null, otherwise return an error
 */
export function checkWifiConfiguration(config, wifi): Error {
  const isPasswordMatched =
    (!config?.wifi_password && !wifi?.password) ||
    config?.wifi_password === wifi?.password;
  const isSSIDMatched = config?.wifi_ssid && config?.wifi_ssid === wifi?.ssid;
  const isConfigSaved = config?.kaidu_configuration_id;

  let error;
  if (!isConfigSaved) {
    error = new Error(`No configuration of this scanner found in the server.`);
  } else if (!isSSIDMatched) {
    error = new Error(`SSID of this scanner is not saved to the server.`);
  } else if (!isPasswordMatched) {
    // console.debug();
    error = new Error(`Password of this scanner is not saved to the server.`);
  }
  return error;
}
/**
 * check if the Wi-Fi in config server is the same as the submitted form
 */
export async function checkServerConfiguration(
  macAddress: string,
  wifi: Wifi,
): Promise<any> {
  // fetch config from server and check it
  // XXXDC replaced with faked single-retry
  // const config =
  //   (await fetchConfigurationByMACWithMultiTries(macAddress)) || {};
  // XXXDC end of replacement
  // XXXDC replaced with faked single-retry and correct wifi
  const config =
    (await fetchConfigurationByMAC(macAddress)) || {};
  config.wifi_ssid = wifi.ssid;
  config.wifi_password = wifi.password;
  // XXXDC end of new code

  const error = checkWifiConfiguration(config, wifi);
  if (error) {
    throw error;
  }
  // check if kaidu_configuration_id appears after sending PUT
  const fetchedConfigId = config?.kaidu_configuration_id;

  // if not found, throw error
  if (!fetchedConfigId) {
    throw new Error(
      'kaidu_configuration_id is not found in Kaidu server. Please try again.',
    );
  }

  return config;
}

/**
 * get advertising data from plug; if no valid plug state, then scanning won't work, should connect and read wifi, then disconnect and compare
 * @description scan for the target device to check plug state
 */
export async function checkBLEConfiguration(
  bleId: string,
  onScanUpdate: (args: any) => void, //XXXDC added
  onScanEnd: (args: any) => void,
  onError: (args: any) => void,
): Promise<{bleId: string}> {
  let plugState;
  let isStopScanningCalled = false;

  const handleDevice = (device: ScannedDeviceFromBLEManager) => {
    // let isVerified = false;
    const {id} = device || {};
    if (id === bleId) {
      // find the target plug, stop scanning
      // this will trigger the handleScanEnd function
      plugState = getPlugStateFromScannedDevice(device);
      console.debug('checkBLEConfiguration- BLE Scan update plugState:', plugState);
      onScanUpdate && onScanUpdate({plugState}); //XXXDC added

      if (plugState === PlugState.CONNECTED) {
        !isStopScanningCalled && stopScanning();
        isStopScanningCalled = true;
      } else if (checkIsConnectionError(plugState)) {
        // finished but not connected
        !isStopScanningCalled && stopScanning();
        isStopScanningCalled = true;
      }
      // ignore all scanned devices once stopScanning is called
      return;
    }
    return;
  };

  const handleScanStart = () => {
    console.debug('checkBLEConfiguration- BLE Scan start');
  };

  const handleScanEnd = () => {
    console.debug('checkBLEConfiguration- BLE Scan ends');
    console.debug('checkBLEConfiguration- plugState:', plugState);
    if (plugState === PlugState.CONNECTED) {
      onScanEnd({plugState});
      return;
    } else if (checkIsConnectionError(plugState)) {
      onScanEnd({plugState});
      return;
    }
    //XXXDC remove not scan-error handling (undo this change)
    //const scanEndError = generateErrorFromPlugState(plugState);
    //scanEndError && onError(scanEndError);
    //XXXDC end of removal
    onScanEnd({plugState});
    return;
  };

  scanBLE(handleDevice, handleScanStart, handleScanEnd, onError, VERIFICATION_TIME);

  return {bleId};
}
