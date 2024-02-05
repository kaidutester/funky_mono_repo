import { Text } from '@kaidu/shared/components/atomic';
import { Button } from '@kaidu/shared/components/atomic/Button';
import { ErrorText } from '@kaidu/shared/domain/error-handling/components/ErrorText';
import { disconnectConnectedDeviceThunk } from '@kaidu/shared/providers/ble-devices';
import { inspect } from '@kaidu/shared/utils';
import { useNavigation } from '@react-navigation/native';
import { deactivateKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useRef, useMemo } from 'react';
import * as Progress from 'react-native-progress';
import { useDispatch, useSelector } from 'react-redux';
import {
  createNativeEventEmitter,
  getMokoBasicModule,
} from '~/lib/NativeModules';
import { STACK_SCREENS } from '~/navigation/routes';
import { checkIsMokoDeviceConnectedToMQTT } from '../../../domains/moko';
import { MbContainer } from '../../../domains/moko/components/organism/MokoScreenFrame';
import { selectMokoGlobalConfig } from '../../../domains/moko/providers/mokoSlice';
import { createFirmwareUpdateInputs } from './processors';
import { tailwind } from '@kaidu/shared/lib/styles';

const MokoModule = getMokoBasicModule();
const eventEmitter = createNativeEventEmitter(MokoModule);

function registerMQTTConnectedMessageListener(
  eventEmitter,
  callback: (boolean) => void
) {
  const mqttMessageListener = eventEmitter.addListener(
    'onMQTTSubscription',
    (event) => {
      console.debug(`Receive MQTT message event: ${inspect(event)}`);
      const { msg } = event || {};
      const isConnected = checkIsMokoDeviceConnectedToMQTT(msg);
      callback(isConnected);
    }
  );
  return mqttMessageListener;
}

function updateResultListener(eventEmitter, callback: (string) => void) {
  const updateListener = eventEmitter.addListener('onUpdate', (event) => {
    console.debug(`Receive update result event: ${inspect(event)}`);

    const result = event.result;
    callback(result);
  });
  return updateListener;
}

/**
 * upgrade MK110 to Kaidu firmware
 */
export function MK110MainContainer({
  deviceName,
  mac,
  mokoUpdateState,
  send,
  onReset,
  ...optionals
}) {
  // Props
  const { context, value } = mokoUpdateState || {};
  const { update } = value || {};
  console.log('MK110MainContainer ~ mokoUpdateState context:', context);
  console.log('MK110MainContainer ~ mokoUpdateState value:', value);

  // Hooks
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  // Global states
  const { mqttServerHost, mqttServerPort, firmwarefilepath } = useSelector(
    selectMokoGlobalConfig
  );

  const firmwareUpdateInputs = useMemo(
    () =>
      createFirmwareUpdateInputs({
        mqttServerHost,
        mqttServerPort,
        firmwarefilepath,
        deviceName,
        mac,
      }),
    [mqttServerHost, mqttServerPort, firmwarefilepath, deviceName, mac]
  );

  // Local ref
  const mqttMessageListener = useRef(null);
  const updateResultListener = useRef(null);

  const startFirmwareUdpate = () => {
    // start firmware update
    // const firmwareUpdateInputs = createFirmwareUpdateInputs({
    //   mqttServerHost,
    //   mqttServerPort,
    //   firmwarefilepath,
    //   deviceName,
    //   mac,
    // });

    send({
      type: 'START_FIRMWARE_UPDATE',
      data: { firmwareUpdateInputs, bleID: mac },
    });
  };

  useEffect(() => {
    updateResultListener.current = eventEmitter.addListener(
      'onUpdate',
      (event) => {
        console.debug(`Receive update result event: ${inspect(event)}`);

        const result = event.result;
        if (result === 'succeeded' || result === 'failed') {
          // deactivateKeepAwake();
          if (result === 'succeeded') {
            send({ type: 'FIRMWARE_UPDATE_SUCCESS' });
          } else if (result === 'failed') {
            send({ type: 'FIRMWARE_UPDATE_FAILED' });
          }
        }
      }
    );

    mqttMessageListener.current = registerMQTTConnectedMessageListener(
      eventEmitter,
      (isConnected) => {
        if (isConnected) {
          send({
            type: 'MOKO_CONNECTED_TO_MQTT',
            data: { firmwareUpdateInputs, bleID: mac },
          });
        }
      }
    );

    console.debug(`Added listener on firmware update result and MQTT message`);
  }, [mac, firmwareUpdateInputs]);

  /**
   * reset before going back home
   */
  const handleGoBackHome = () => {
    deactivateKeepAwake();

    // remove listeners
    if (mqttMessageListener.current) {
      mqttMessageListener.current.remove();
    }
    if (updateResultListener.current) {
      updateResultListener.current.remove();
    }

    // disconnect BLE
    dispatch(disconnectConnectedDeviceThunk(mac));
    MokoModule.disconnectBLE();

    // reset state
    onReset && onReset();
    navigation.navigate({
      name: STACK_SCREENS.HOME,
    });
  };

  // Effects
  // activateKeepAwake();
  const isError =
    mokoUpdateState.matches('error') || mokoUpdateState.matches('update.error');
  const isPending = !mokoUpdateState.matches('final') && !isError;
  const errorMsg = context?.errorMsg;
  const msg = context?.msg;

  return (
    <>
      {isPending ? (
        <MbContainer>
          <Progress.Pie size={180} indeterminate={true} />
          <Text>
            State:{' '}
            {update ||
              'Waiting: Update will started after the scanner is connected to MQTT'}
          </Text>
          <Text>{msg}</Text>
        </MbContainer>
      ) : null}
      {isError ? (
        <>
          <ErrorText>{errorMsg}</ErrorText>
          <Button onPress={startFirmwareUdpate} title={'Retry'} />
        </>
      ) : null}
      {mokoUpdateState.matches('final') ? (
        <Button
          onPress={handleGoBackHome}
          title={'Finish'}
          style={tailwind('mt-4')}
        />
      ) : (
        <Button
          onPress={handleGoBackHome}
          title={'Cancel'}
          style={tailwind('mt-4')}
        />
      )}
    </>
  );
}
