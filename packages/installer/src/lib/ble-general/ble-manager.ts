/**
 * @description Adaptor module for direct operations of BLE manager
 */
import { Service, ScannedDevice } from '../../types/interfaces';
import { BleManager } from 'react-native-ble-plx';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import { handle } from '@kaidu/shared/utils';

const scanOptions = { allowDuplicates: false };

export const bleManager = new BleManager(); //global dependency

/**
 * @description use the ble manager to scan devices
 * @param  {time} scanTime=10000
 * @returns {timeoutID}
 */
export function scanBLE(
  onDevice = (device) => {},
  onStart = () => {},
  onEnd = () => {},
  onError = (err) => {},
  scanTime = 7000
): NodeJS.Timeout {
  //scan devices and update status
  onStart && onStart();
  const timeoutID: NodeJS.Timeout = setTimeout(() => {
    //stop scanning after given time
    stopScanning();
    onEnd && onEnd();
  }, scanTime);

  bleManager.startDeviceScan(null, scanOptions, (error, device) => {
    if (error) {
      // Handle error (scanning will be stopped automatically)
      console.error(`bleManager scan() failed: ${error.message}`);
      onError && onError(error);
      return;
    }

    if (device != null) {
      onDevice && onDevice(device);
    }
  });

  return timeoutID;
}

export function scanBLEWithoutLimitTime(onDevice, onError) {
  bleManager.startDeviceScan(null, scanOptions, (error, device) => {
    if (error) {
      // Handle error (scanning will be stopped automatically)
      console.error(`bleManager scan() failed: ${error.message}`);
      onError(error);
      return;
    }

    if (device != null) {
      onDevice(device);
    }
  });
}

export async function getState() {
  const [res, resErr] = await handle(BluetoothStateManager.getState());
  if (resErr) throw new Error('Failed to get bluetooth state');

  return res;
}

export async function checkIsPowerOn() {
  const state = await getState();
  return state === 'PoweredOn';
}

export async function enable() {
  //enable bluetooth
  const [res, resErr] = await handle(BluetoothStateManager.enable());
  if (resErr) throw new Error('Failed to enable bluetooth setting');
  return res;
}

export function stopScanning() {
  bleManager.stopDeviceScan();
  console.debug(`stopped scanning`);
}

/**
 * @param  {string} deviceIdentifier
 */
export async function fetchServicesForDevice(
  deviceIdentifier: string
): Promise<Array<Service>> {
  const [discoveredDevice, discoverErr] = await handle(
    connectAndDiscoverDevice(deviceIdentifier)
  );
  if (discoverErr)
    throw new Error(
      `Failed to discover services on device ${deviceIdentifier}`
    );

  const [res, resErr] = await handle(discoveredDevice.services());
  if (resErr)
    throw new Error(`Failed to get services from device ${deviceIdentifier}`);
  return res;
}

export async function connectAndDiscoverDevice(deviceId: string) {
  console.debug(`discoverDevice is called`);

  const [isConnected, checkErr] = await handle(
    bleManager.isDeviceConnected(deviceId)
  );
  if (checkErr) {
    console.error(`Failed to check if device ${deviceId} is connected`);
    throw new Error(`Failed to check connection ${deviceId}`);
  }

  if (!isConnected) {
    try {
      await bleManager.connectToDevice(deviceId);
    } catch (error) {
      console.error(`Failed to connect to device ${deviceId}`);
      throw new Error(`Failed to connect to device ${deviceId}`);
    }
  }

  const [res, resErr] = await handle(
    bleManager.discoverAllServicesAndCharacteristicsForDevice(deviceId)
  );

  if (resErr) {
    console.error(
      `Failed to discover services and characteristics for device ${deviceId}`
    );
    console.error(resErr);
    throw new Error(`Failed to discover device ${deviceId}`);
  }
  return res;
}

export async function discoverDeviceMultiTries(deviceId: string, num: number) {
  let count = 0;
  let res, resErr;
  while (count < num) {
    [res, resErr] = await handle(connectAndDiscoverDevice(deviceId));
    if (res) {
      return res;
    }
    if (resErr) {
      count++;
    }
  }

  console.error('tried discoverDevice: ' + resErr?.message);
  throw new Error(`Failed to discover device: ${resErr?.message}`);
}

/**
 * connect to BLE device
 * @param  {string} deviceId
 * @param  {number=1} maxErrorLevel
 * @return {Promise<connectedDevice>}
 */
export async function connectToDevice(
  deviceId: string,
  maxErrorLevel: number = 1
) {
  console.debug(`connectToDevice runs`);
  let n = 0;
  let result, resultErr;
  while (n < maxErrorLevel && resultErr) {
    [result, resultErr] = await handle(bleManager.connectToDevice(deviceId));
    if (resultErr) {
      n++;
    }
  }
  if (n >= maxErrorLevel && resultErr) throw resultErr;
  console.debug(`connectToDevice finishes`);
  return result;
}

/**
 * @description disconnect BLE device by mac address
 * @param  {string} deviceId
 * @returns Promise
 */
export async function cancelConnection(deviceId: string): Promise<boolean> {
  const isConnected = await bleManager.isDeviceConnected(deviceId);
  console.debug(
    `${deviceId} is ${isConnected ? 'connected' : 'not connected'}`
  );
  if (isConnected) {
    const [result, resultErr] = await handle(
      bleManager.cancelDeviceConnection(deviceId)
      // bleManager.cancelDeviceConnection("AC:67:B2:09:5B:75"),
    );
    if (resultErr) throw new Error('Failed to disconnect');
    if (result) {
      console.debug(`Disconnected ${deviceId}`);
      return true;
    }
    return false;
  }
  console.debug(`Disconnected ${deviceId}`);
  return true;
}

export async function isDeviceConnected(deviceId: string): Promise<boolean> {
  const [isConnected, resultErr] = await handle(
    bleManager.isDeviceConnected(deviceId)
  );
  if (resultErr) throw new Error('Failed to check isDeviceConnected');
  return isConnected;
}

export async function fetchDevice(deviceId: string) {
  const [result, resultErr] = await handle(bleManager.devices([deviceId]));
  if (resultErr) throw new Error('fetchDevice failed');

  return result.find((device) => device.id === deviceId);
}

export async function requestMTU(
  deviceMac: string,
  mtu: number
): Promise<void> {
  const discoveredDevice = await connectAndDiscoverDevice(deviceMac);
  await discoveredDevice.requestMTU(mtu);
}
