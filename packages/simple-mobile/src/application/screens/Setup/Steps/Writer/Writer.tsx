import { Heading } from '@kaidu/shared/components/atomic/Heading';
// import { updateDeviceName } from '@kaidu/shared/providers/ble-devices';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useUnmountPromise from 'react-use/lib/useUnmountPromise';
import { useSWRConfig } from 'swr';
import { executeWriteWithTimeout } from './processors';
import { View } from '@kaidu/shared/components/atomic/View';
import { clearSetup, updateSetupState } from '@kaidu/shared/lib/redux/setupSlice';
import { AsyncLifecycle } from '@kaidu/shared/types';

/**
 * update configuration to server and update wifi to BLE device
 */
export function Writer({ data, bleId, onFulfilled, onRejected, ...optionals }: {data: any; bleId: string; [x:string]:any;}) {
  // Hooks
  const { mutate } = useSWRConfig();
  const dispatch = useDispatch();
  const mounted = useUnmountPromise();

  useEffect(() => {
    console.debug(`Writer is mounted`);
    dispatch(updateSetupState(AsyncLifecycle.PENDING)); // update setup state
    mounted(executeWriteWithTimeout(bleId, data, mutate))
      .then(() => {
        onFulfilled();
      })
      .catch(err => {
        onRejected(err); // onRejected should disconnect
      });
  }, []);

  return (
    <View>
      {/* XXXDC was <Heading>Sending configuration</Heading> */}
      <Heading>Storing your WiFi settings. Remain near your Kaidu scanner until the operation finishes.</Heading>
    </View>
  );
}
