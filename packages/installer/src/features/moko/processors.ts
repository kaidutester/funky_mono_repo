import { ScannedDevice } from '@kaidu/shared/features/ble-general';
import {
  MokoMiniMQTTConfig,
  GeneralMokoMiniMQTTConfig,
  MokoDeviceTypeEnum,
} from './types';
import { MOKO_CONSTANTS } from './constants';
import {cond, always, or, pipe, prop} from 'ramda';

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

export function getMokoPlugModelType(device: ScannedDevice): MokoDeviceTypeEnum {
  return pipe(or(prop('localName'), prop('name')), getMokoDeviceTypeByName)(device);
}
