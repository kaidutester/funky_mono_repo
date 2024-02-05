import React, { useEffect } from 'react';
import { connectToDevice } from '@kaidu/shared/features/ble-general';
import { Heading } from '@kaidu/shared/components/atomic/Heading';
import { promiseWithTimeout } from '@kaidu/shared/utils';
import useUnmountPromise from 'react-use/lib/useUnmountPromise';

const bleTimeoutError = new Error('Bluetooth connection timed out. Please try again later.');

/**
 * @description if the device is not connected at the end, an error will be thrown
 * @param deviceId 
 * @returns 
 */
async function connectBLEWithTimeout(deviceId) {
  const isDeviceConnected = promiseWithTimeout(connectToDevice(deviceId, 2), 10000, bleTimeoutError);
  return isDeviceConnected;
}


export function SetupConnect({ bleId, onFulfilled, onRejected }) {
  const mounted = useUnmountPromise();
  useEffect(() => {
    mounted(connectBLEWithTimeout(bleId)).then(onFulfilled).catch(onRejected);
  }, []);

  return (
    <Heading>Connecting via Bluetooth</Heading>
  )
}
