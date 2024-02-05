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
  AndroidMokoModule,
  createNativeEventEmitter,
} from '~/lib/NativeModules';
import { updateGlobalWiFi } from '~/lib/redux/wifiSlice';
import { helpers } from '@kaidu/shared/utils';
import { MokoBleController } from './MokoBleController';
import MokoConfigController from './MokoConfigController';
import { ErrorContainer, MbContainer } from '../../../organism/MokoScreenFrame';
import { Wifi } from '@kaidu/shared/features/wifi';
import { STACK_SCREENS } from '~/navigation/routes';
import { DEFAULT_ERROR } from '@kaidu/shared/features/error';
import { cancelConnection } from '@kaidu/shared/features/ble-general';

interface Props {
  device: ScannedDevice;
  wifi: Wifi;
  [x: string]: any;
}

const MokoModule = AndroidMokoModule;
const eventEmitter = createNativeEventEmitter(MokoModule);


/**
 * Called when the MQTT config has been written to the Moko device, i.e. after BLE connected
 * Wait for 7s
 * assume it is connected to Moko MQTT server
 */
function addMqttConfigEventListener(eventEmitter, onMQTTConnectedCallback) {
  console.debug(`addMqttConfigEventListener is called`);
  const mqttConfigListener = eventEmitter.addListener(
    'onMQTTConfig',
    (event) => {
      console.debug(`Receive event: ${helpers.inspect(event)}`);
      const mqttConfig = event.mqttConfig;
      if (mqttConfig === 'done') {
        console.debug(`Save MQTT config to Moko scanner is done`);
        BackgroundTimer.setTimeout(() => {
          console.debug(
            'MQTT config is saved to the scanner. MQTT connection will start soon'
          );
          onMQTTConnectedCallback();
        }, 7 * 1000);
      }
    }
  );
}


/**
 * 
 */
export function MK110MainContainer({
  device,
  wifi,
  ...optionals
}: Props) {
  // Hooks
  const navigation = useNavigation();
  const dispatch = useDispatch();

  //states
  const [status, setStatus] = useState('processMQTTConfig');
  const [error, setError] = useState(DEFAULT_ERROR);


  // register event listeners at the beginning
  useEffect(() => {
    // Use MokoModule to interact with Moko scanners
    if (Platform.OS === 'android') {
      const eventEmitter = createNativeEventEmitter(MokoModule);

      // register order task timeout listener
      // if sync order timeout, should display error message and disconnect BLE
      const orderTaskListener = eventEmitter.addListener(
        'onOrderTask',
        (event) => {
          console.debug(`Receive event: ${helpers.inspect(event)}`);
          const orderError = event.orderError;
          if (orderError === 'timeout') {
            cancelConnection(device?.id);
            setError({
              message:
                'Failed to save MQTT configuration to the scanner. Please press and hold to reset the scanner then turn it on to try again.',
              type: orderError,
            });
            setStatus('rejected');
          } else {
            console.debug(`Order error: ${orderError}`);
          }
        }
      );
    }

    addMqttConfigEventListener(eventEmitter, () =>
      navigation.navigate({
        name: STACK_SCREENS.MOKO.UPGRADE,
        params: { device },
        merge: true,
      })
    );
  }, []);

  const handleMQTTConfigSuccess = () => {
    //MQTT config is stored in the Native module of this App
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

  const handleBLEConnectionSuccess = async () => {
    console.log("file: MK110MainContainer.tsx:119 ~ handleBLEConnectionSuccess ~ handleBLEConnectionSuccess is called")
    //wait for the success message
    
    // do nothing
    if (wifi?.ssid) {
      dispatch(updateGlobalWiFi(wifi));
    }
  };

  const handleBLEConnectionError = () => { };

  activateKeepAwake();

  const isLoading =
    status !== 'idle' && status !== 'resolved' && status !== 'rejected';

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
          device={device}
          wifi={wifi}
        />
      ) : null}
      {status === 'startConnectBLE' ? (
        <MokoBleController
          device={device}
          onSuccess={handleBLEConnectionSuccess}
          onError={handleBLEConnectionError}
        ></MokoBleController>
      ) : null}
      {status === 'rejected' ? (
        <ErrorContainer>
          <ErrorText>{error?.message}</ErrorText>
          {/* <StyledBtn title="Back" onPress={() => setStatus('idle')} /> */}
        </ErrorContainer>
      ) : null}
    </>
  );
}
