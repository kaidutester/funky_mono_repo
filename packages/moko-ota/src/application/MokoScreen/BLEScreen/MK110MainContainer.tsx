import { useNavigation } from '@react-navigation/native';
import { activateKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import * as Progress from 'react-native-progress';
import { useDispatch } from 'react-redux';
import { ErrorText } from '@kaidu/shared/domain/error-handling/components/ErrorText';
import { ScannedDevice } from '~/types/interfaces';
import {
  createNativeEventEmitter,
  getMokoBasicModule,
  initMokoBasicModule,
} from '~/lib/NativeModules';
import { updateGlobalWiFi } from '~/lib/redux/wifiSlice';
import { helpers, inspect } from '~/utils';
import { MokoBleController } from './MokoBleController';
import { MokoConfigController } from './MokoConfigController';
import {
  ErrorContainer,
  MbContainer,
} from '../../../domains/moko/components/organism/MokoScreenFrame';
import { Wifi } from '@kaidu/shared/features/wifi';
import { STACK_SCREENS } from '~/navigation/routes';
import { DEFAULT_ERROR } from '@kaidu/shared/features/error';
import { cancelConnection } from '@kaidu/shared/features/ble-general';
import { useMachine } from '@xstate/react';
import { mokoUpdateStateMachine } from '../../../domains/moko';
import { Button } from '@kaidu/shared/components/atomic/Button';
import { tailwind } from '@kaidu/shared/lib/styles';
import { View } from '@kaidu/shared/components/atomic/View';

const MokoModule = getMokoBasicModule();
const eventEmitter = createNativeEventEmitter(MokoModule);

/**
 * Called when the MQTT config has been written to the Moko device, i.e. after BLE connected,
 * Wait for 7s
 */
function addMqttConfigEventListener(eventEmitter, onMQTTConfiguredCallback) {
  console.debug(`addMqttConfigEventListener is called`);
  const mqttConfigListener = eventEmitter.addListener(
    'onMQTTConfig',
    (event) => {
      console.debug(`Receive event: ${inspect(event)}`);
      const mqttConfig = event.mqttConfig;
      // return
      if (mqttConfig === 'done') {
        console.debug(`Save MQTT config to Moko scanner is done`);
        BackgroundTimer.setTimeout(() => {
          console.debug(
            'MQTT config is saved to the scanner. MQTT connection will start soon'
          );
          onMQTTConfiguredCallback();
        }, 7 * 1000);
      }
    }
  );
}

/**
 * MQtt config and BLE
 */
export function MK110MainContainer({
  device,
  wifi,
  ...optionals
}: {
  device: ScannedDevice;
  wifi: Wifi;
  [x: string]: any;
}) {
  // Hooks
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [mokoUpdateState, send] = useMachine(mokoUpdateStateMachine);


  //states
  const [status, setStatus] = useState('processMQTTConfig');
  const [error, setError] = useState(DEFAULT_ERROR);

  /**
   * MQTT config has been written to the Moko device
   * */ 
  const handleBLEConfigurationSuccess = () => {
    if (wifi?.ssid) {
      dispatch(updateGlobalWiFi(wifi));
    }

    // @Asher: BLE_SUCCESS event will trigger app to publish message to device
    // after MokoUpgradeScreen is rendered, it will be registered to listen to MQTT messages
    send({ type: 'BLE_SUCCESS'});

    return navigation.navigate({
      name: STACK_SCREENS.MOKO.UPGRADE,
      params: { device },
    });
  };

  /**
   * Use MokoModule to interact with Moko scanners
   */
  useEffect(() => {
    if (Platform.OS === 'android') {
      const eventEmitter = createNativeEventEmitter(MokoModule);

      /**
       * register order task timeout listener
       * if sync order timeout, should display error message and disconnect BLE
       */
      const orderTaskListener = eventEmitter.addListener(
        'onOrderTask',
        (event) => {
          console.debug(`Receive event: ${inspect(event)}`);
          const orderError = event?.orderError;
          if (orderError === 'timeout') {
            cancelConnection(device?.id);
            const errMsg = 'Order task time out. Failed to save MQTT configuration to the scanner. Please press and hold to reset the scanner then turn it on to try again.';
            setError({
              message: errMsg,
              type: orderError,
            });
            setStatus('rejected');
            send({type: 'GET_ERROR', errorMsg: errMsg})
          } else if (orderError) {
            console.debug(`Order error: ${orderError}`);
            cancelConnection(device?.id);
          }
        }
      );
    }

    addMqttConfigEventListener(eventEmitter, handleBLEConfigurationSuccess);
  }, []);

  const handleMQTTConfigSuccess = () => {
    // MQTT config is stored in the Native module of this App
    setStatus('startConnectBLE');
  };

  const handleMQTTConfigError = () => {
    console.debug('MQTT config error occurs');
    setStatus('updateFailed');
    setError({
      message: 'Setting MQTT config was rejected. Please go back and retry',
      type: 'UNKNOWN',
    });
  };

  activateKeepAwake();

  const isLoading =
    status !== 'idle' && status !== 'resolved' && status !== 'rejected';

  const { bleID, displayName } = device || {};
  const mokoConfigData = {
    deviceName: displayName,
    mac: bleID,
    wifi,
  };

  // return <></>;

  const { context, value } = mokoUpdateState || {};
  const { ble } = value || ({} as any);
  console.log('file: MK110MainContainer  ~ value:', value);
  console.log('file: MK110MainContainer ~ context:', context);

  /**
   * Cancel current operation
   */
  const handleCancel = () => {
    initMokoBasicModule();
    MokoModule.disconnectBLE();

    // connect to a fake device
    // const bleConnectioncallback = () => {
    //   MokoModule.disconnectBLE();
    // };
    // MokoModule.connectBLE('FF:FF:FF:FF:FF:FF', bleConnectioncallback);

    navigation.navigate(STACK_SCREENS.HOME);
  };

  return (
    <>
      {isLoading ? (
        <MbContainer>
          <Progress.Pie size={180} indeterminate={true} />
        </MbContainer>
      ) : null}
      {status === 'processMQTTConfig' && wifi ? (
        <MokoConfigController
          onSuccess={handleMQTTConfigSuccess}
          onError={handleMQTTConfigError}
          wifi={wifi}
          data={mokoConfigData}
          send={send}
        />
      ) : null}
      {status === 'startConnectBLE' ? (
        <MokoBleController
          bleID={bleID}
          send={send}
          ble={ble}
          context={context}
        ></MokoBleController>
      ) : null}
      {status === 'rejected' ? (
        <ErrorContainer>
          <ErrorText>{error?.message}</ErrorText>
        </ErrorContainer>
      ) : null}
      <View style={tailwind('my-8')}>
        <Button title={'Cancel'} style={tailwind('w-40')} onPress={handleCancel} />
      </View>
    </>
  );
}
