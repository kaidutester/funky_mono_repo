import { Heading } from '@kaidu/shared/components/atomic/Heading';
import { updateDeviceName } from '@kaidu/shared/providers/ble-devices';
import React, { useEffect } from 'react';
// import { View } from 'react-native';
import { View } from '@kaidu/shared/components/atomic/View';
import { useDispatch } from 'react-redux';
import useUnmountPromise from 'react-use/lib/useUnmountPromise';
import { useSWRConfig } from 'swr';
import { executeLTEWriteWithTimeout } from './processors';
import { DataForWritingConfig } from './types';

/**
 * 
 */
export function WriterLTE({ data, onFulfilled, onRejected, ...optionals }: { data: DataForWritingConfig, onFulfilled: Function, onRejected: Function, [x: string]: any }) {
  // update configuration to server: device name, mac address, customer name, ...
  // update configuration to BLE device
  const { bleId, device_name, mac_address } = data || {};

  // Hooks
  const { mutate } = useSWRConfig();
  const dispatch = useDispatch();
  const mounted = useUnmountPromise();

  useEffect(() => {
    console.debug(`Writer is mounted`);
    mounted(executeLTEWriteWithTimeout(data, mutate))
      .then(() => {
        onFulfilled();
        // update displayed device name on the scanned list
        dispatch(updateDeviceName({ name: device_name, id: bleId, mac: mac_address }));
      })
      .catch(err => {
        onRejected(err); // onRejected should disconnect
      });
  }, []);

  return (
    <View>
      <Heading>Sending configuration</Heading>
    </View>
  );
}
