import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useState } from 'react';
import * as Progress from 'react-native-progress';
import { AndroidMokoModule, createNativeEventEmitter } from '~/lib/NativeModules';
import { inspect } from '@kaidu/shared/utils';
import {
  MbContainer,
} from '../../../organism/MokoScreenFrame';
import { MokoFirmwareUpdateController } from './MokoFirmwareUpdateController';
import { disconnectConnectedDeviceThunk } from '@kaidu/shared/providers/ble-devices';
import { useDispatch } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { DEFAULT_ERROR } from '@kaidu/shared/features/error';
import { SuccessView } from '../views/SuccessView';
import { STACK_SCREENS } from '~/navigation/routes';
import { ErrorView } from '../views/ErrorView';

/**
 * upgrade MK110 to Kaidu firmware
 */
export function MK110MainContainer({ device, mac, ...optionals }) {

  // Hooks
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  // console.debug(`device: ${inspect(device)}`);
  // const mac = device?.id;

  //states
  const [status, setStatus] = useState<string>('startUpdate'); //updateDone, 'startUpdate'
  const [error, setError] = useState(DEFAULT_ERROR);

  const MokoModule = AndroidMokoModule;

  const handleUpdateSuccess = () => {
    console.debug(`handleUpdateSuccess is called`);
    setStatus('updateDone');
    navigation.setOptions({ title: 'Installed Kaidu firmware successfully' });
  };

  const handleUpdateError = async ({ error, ...args }) => {
    //display unrecoverable error message during update
    setStatus('updateFailed');
    setError({
      message:
        'Firmware update failed. If the light is solid blue, please press "Retry". If the light is blinking blue, please press and hold the power button on your scanner to reset, then turn it on and restart the APP.',
      type: 'UNKNOWN',
    });

    // disconnect BLE
    const resultAction = await dispatch(disconnectConnectedDeviceThunk(mac));
    const originalPromiseResult = unwrapResult(resultAction);
    AndroidMokoModule.disconnectBLE();
  };
  
  useEffect(() => {
    // listen to firmware update result from Moko MQTT server
    if (MokoModule) {
      const eventEmitter = createNativeEventEmitter(MokoModule);
      const updateListener = eventEmitter.addListener('onUpdate', event => {
        console.debug(`Receive update result event: ${inspect(event)}`);

        const result = event.result;
        if (result === 'succeeded' || result === 'failed') {
          deactivateKeepAwake();
          if (result === 'succeeded') {
            handleUpdateSuccess();
          } else if (result === 'failed') {
            handleUpdateError({
              error: new Error(
                'MQTT server responds that update failed. Please retry later.',
              ),
            });
          }
        }
      });
      console.debug(`Added listener on firmware update result`);
    }
  }, []);

  activateKeepAwake();

  const isPending = status !== 'idle' &&
    status !== 'updateDone' &&
    status !== 'updateFailed';

  return (
    <>
      {isPending ? (
        <MbContainer>
          <Progress.Pie size={180} indeterminate={true} />
        </MbContainer>
      ) : null}
      {/* {status === 'startUpdate' ? (
        <MokoFirmwareUpdateController
          device={device}
          onSuccess={handleUpdateSuccess}
          onError={handleUpdateError}
        />
      ) : null} */}
      {status === 'updateDone' ? (
        <SuccessView onPress={() =>
          navigation.navigate({
            name: STACK_SCREENS.SETUP.MAIN,
            params: {
              deviceId: mac,
              uuid: mac,  // TODO: remove uuid and deviceId, use bleId instead
              mac: mac,
              bleId: mac, // Moko only have BLE ID
              // shouldUseGlobalWifi: true,
            },
          })
        } />
      ) : null}
      {status === 'updateFailed' ? (
        <ErrorView text={error?.message} onRetry={() => setStatus('startUpdate')} />
      ) : null}
    </>
  );
}
