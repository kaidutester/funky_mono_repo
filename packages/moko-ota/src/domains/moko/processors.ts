import { ScannedDevice } from '@kaidu/shared/features/ble-general';
import {
  MokoMiniMQTTConfig,
  GeneralMokoMiniMQTTConfig,
  MokoDeviceTypeEnum,
} from './types';
import { MOKO_CONSTANTS } from './constants';
import { or, pipe, prop, equals } from 'ramda';
import { createMQTTClient } from '../../features/mqtt';
import { IMqttClient } from 'sp-react-native-mqtt';

function generateGeneralMQTTConfig(): GeneralMokoMiniMQTTConfig {
  const host = MOKO_CONSTANTS.MQTT_HOST;
  const port = MOKO_CONSTANTS.MQTT_PORT;
  const cleanSession = true;
  const connectMod = 0;
  const qos = 1;
  const keepAlive = 60;

  return { host, port, cleanSession, connectMod, qos, keepAlive };
}

export function generateMQTTConfig(
  clientId: string,
  uniqueId: string,
  topicSubscribe: string,
  topicPublish: string
): MokoMiniMQTTConfig {
  const general = generateGeneralMQTTConfig();
  const result = {
    ...general,
    clientId,
    uniqueId,
    topicSubscribe,
    topicPublish,
  };
  return result;
}

export function generateDeviceClientID(
  appClientId: string,
  deviceId: string
): string {
  return `${appClientId}-${deviceId}`;
}

export function generateDeviceID(macAddress: string): string {
  return `${macAddress}-deviceID`;
}

export function generateDeviceToAppTopic(
  deviceId: string,
  appClientId
): string {
  return `${appClientId}/${deviceId}/device_to_app`;
}

export function generateAppToDeviceTopic(
  deviceId: string,
  appClientId
): string {
  return `${appClientId}/${deviceId}/app_to_device`;
}

export function checkIsMokoMini(device: ScannedDevice): boolean {
  if (!device) {
    return false;
  }

  return checkIsMokoMiniName(device?.localName);
}

export function checkIsMokoMK110(device: ScannedDevice): boolean {
  if (!device) {
    return false;
  }

  return checkIsMokoMK110Name(device?.localName);
}

function checkIsMokoMiniName(name: string): boolean {
  if (!name) {
    return false;
  }
  return name?.toUpperCase()?.startsWith('MINI'); // Model: MKGW-mini
}

function checkIsMokoMK110Name(name: string): boolean {
  if (!name) {
    return false;
  }
  const isMKName = name?.toUpperCase()?.startsWith('MK'); // Model: MK110
  return isMKName;
}

export function getMokoDeviceTypeByName(name: string): MokoDeviceTypeEnum {
  if (checkIsMokoMK110Name(name)) {
    return MokoDeviceTypeEnum.MK110;
  } else if (checkIsMokoMiniName(name)) {
    if (name?.toUpperCase()?.includes('MINI-01')) {
      return MokoDeviceTypeEnum.MokoMini01;
    } else if (name?.toUpperCase()?.includes('MINI-02')) {
      return MokoDeviceTypeEnum.MokoMini02;
    } else if (name?.toUpperCase()?.includes('MINI-03')) {
      return MokoDeviceTypeEnum.MokoMini03;
    }
  }
  return MokoDeviceTypeEnum.UNKNOWN;
}

export function getMokoPlugModelType(
  device: ScannedDevice
): MokoDeviceTypeEnum {
  return pipe(
    or(prop('localName'), prop('name')),
    getMokoDeviceTypeByName
  )(device);
}

/**
 * MQTT client connect to Moko MQTT broker
 */
export async function createMQTTClientToMoko(clientID = 'testID'): Promise<IMqttClient> {
  const client = await createMQTTClient(
    MOKO_CONSTANTS.MQTT_HOST,
    MOKO_CONSTANTS.MQTT_PORT,
    clientID
  );
  console.log("createMQTTClientToMoko ~ client ID:", clientID);

  return client;
}

/**
 * test if Moko MQTT is connectable, auto-disconnect after 1s
 * @param onStateChange 
 */
export async function testMQTTConnection(onStateChange?: (state: 'connected' | 'error') => void) {
  return createMQTTClientToMoko().then(mokoMqttClient => {
    mokoMqttClient.on('closed', function () {
      console.log('mqtt.event.closed');
    });

    mokoMqttClient.on('error', function (msg) {
      console.log('mqtt.event.error', msg);
      onStateChange && onStateChange('error');
    });

    mokoMqttClient.on('message', function (msg) {
      console.log('mqtt.event.message', msg);
    });

    mokoMqttClient.on('connect', function () {
      console.log('Moko MQTT broker connected');
      onStateChange && onStateChange('connected');
      const topic = 'MK110-69FE/ashertest076/app_to_device';
      const payload = 'testMQTTConnection';
      mokoMqttClient.publish(topic, payload, 0, false);

      setTimeout(() => {
        mokoMqttClient.disconnect();
      }, 1000);
    });

    mokoMqttClient.connect();
  });
}

/**
 * 4.2.10 Indicator Status
 * http://doc.mokotechnology.com/index.php?s=/1&page_id=160
 */
export function checkIsMokoIndicatorStatusMsg(hexString: string) {
  if (!hexString) {
    return false;
  }

  return hexString?.toUpperCase().startsWith('1B');
}

/**
 * either device is publishing network connection or responding Indicator Status
 */
export function checkIsMokoDeviceConnectedToMQTT(hexString: string) {
  if (!hexString) {
    return false;
  }
  const dataKey = hexString?.toUpperCase().slice(0, 2);
  if (dataKey === '1B') {
    // 1B: Indicator Status
    return true;
  } else if (dataKey === '24') {
    // 4.4.4 Network Connection Status
    // get last two character from hexString
    const lastTwoChar = hexString?.toUpperCase().slice(-2);
    return lastTwoChar === '01';
  }
}