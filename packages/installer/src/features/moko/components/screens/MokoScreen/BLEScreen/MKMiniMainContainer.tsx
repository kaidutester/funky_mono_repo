import { ScannedDevice } from '@kaidu/shared/features/ble-general';
import { DEFAULT_ERROR } from '@kaidu/shared/features/error';
import { Wifi } from '@kaidu/shared/features/wifi';
import { AsyncLifecycle } from '@kaidu/shared/types';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { getMokoProModule, initMokoProModule } from '~/lib/NativeModules';
import { STACK_SCREENS } from '~/navigation/routes';
import {
  generateAppToDeviceTopic, generateDeviceClientID, generateDeviceID, generateDeviceToAppTopic, generateMQTTConfig
} from '../../../../processors';
import {
  ChangeingMokoMiniMQTTConfig,
  MokoMiniMQTTConfig
} from '../../../../types';
import { MOKO_MINI_BLE_RUNNING_TEXT } from '../constants';
import { ErrorView } from '../views/ErrorView';
import { PendingView } from '../views/PendingView';
import { inspect, promiseWithTimeout, sleep } from '@kaidu/shared/utils';
import {getAPPClientIDForMQTT} from '../../../../../firmware';

async function connectAppToMQTTServer(mqttConfig: MokoMiniMQTTConfig) {
  const mokoProModule = getMokoProModule();
  await mokoProModule.connectMqtt(JSON.stringify(mqttConfig));
}

async function saveMQTTConfigToPlug(mac: string, wifi: Wifi, appClientId: string) {
  console.debug('MKMini BLE process is started');

  const mokoProModule = initMokoProModule();
  if (mokoProModule) {
    await mokoProModule.connectBLE(mac);

    const deviceId = generateDeviceID(mac);
    const deviceClientId = generateDeviceClientID(appClientId, deviceId);
    const topicPublish = generateAppToDeviceTopic(deviceId, appClientId);
    const topicSubscribe = generateDeviceToAppTopic(deviceId, appClientId);
    const {ssid: wifiSSID, password: wifiPassword} = wifi || {};

    const changingMQTTConfig: ChangeingMokoMiniMQTTConfig = {
      appClientId,
      deviceClientId,
      deviceId,
      topicPublish,
      topicSubscribe,
      wifiSSID,
      wifiPassword,
    };

    await sleep(2000);
    console.debug('saveMQTTConfigToPlug save config: ', changingMQTTConfig);
    await mokoProModule.sendMokoTaskOrders(
      mac,
      JSON.stringify(changingMQTTConfig)
    );

    await sleep(1000);
    await mokoProModule.sendExitConfigModeOrder();
    console.debug('sendExitConfigModeOrder');

    // connect App to MQTT Server
    const mqttConfig = generateMQTTConfig(
      appClientId,
      deviceId,
      topicSubscribe,
      topicPublish
    );
    await connectAppToMQTTServer(mqttConfig);
    await sleep(7000);
  }

  console.debug('All MokoPro modules MQTT operations are done');
  return;
}

interface Props {
  device: ScannedDevice;
  wifi: Wifi;
  [x: string]: any;
}

export function MKMiniMainContainer({ device, wifi, ...optionals }: Props) {
  // Props
  const mac = device?.id;

  //Global state
  const appClientId = getAPPClientIDForMQTT();

  // Hooks
  const navigation = useNavigation();

  const [status, setStatus] = useState(AsyncLifecycle.IDLE);
  const [error, setError] = useState(DEFAULT_ERROR);

  const handleSaveMQTTConfigToPlug = async () => {
    const timeoutError = new Error("Set MQTT configuration timeout. Please try again later.");
    setStatus(AsyncLifecycle.PENDING);
    promiseWithTimeout(saveMQTTConfigToPlug(mac, wifi, appClientId), 15000, timeoutError)
      .then(() => {
        console.debug('MK Mini BLE process is fulfilled');
        setStatus(AsyncLifecycle.FULFILLED);
      })
      .catch((err) => {
        setStatus(AsyncLifecycle.REJECTED);
        setError(err);
        console.debug('MK Mini BLE process is rejected');
      });
  };

  useEffect(() => {
    if (status === AsyncLifecycle.IDLE) {
      handleSaveMQTTConfigToPlug();
    }

    if (status === AsyncLifecycle.FULFILLED) {
      // setStatus(AsyncLifecycle.IDLE);
      navigation.navigate({
        name: STACK_SCREENS.MOKO.UPGRADE,
        params: { device },
        merge: true,
      });
    }
  }, [status]);

  const handleCancel = () => {
    setStatus(AsyncLifecycle.IDLE);
    navigation.goBack();
    return;
  };

  return (
    <>
      {status === AsyncLifecycle.PENDING ? (
        <PendingView onCancel={handleCancel} text={MOKO_MINI_BLE_RUNNING_TEXT} />
      ) : null}
      {status === AsyncLifecycle.REJECTED ? (
        <ErrorView text={error?.message} onRetry={() => setStatus(AsyncLifecycle.IDLE)} />
      ) : null}
    </>
  );
}
