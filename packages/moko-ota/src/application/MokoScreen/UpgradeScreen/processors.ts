import { getAPPClientIDForMQTT, KAIDU_FIRMWARE_URL } from '../../../features/firmware';
import { MokoProcessor } from '~/lib/moko-device';

/**
 * 
 */
export function createFirmwareUpdateInputs({mqttServerHost, mqttServerPort, firmwarefilepath, deviceName, mac}) {
  const appClientId = getAPPClientIDForMQTT();
  const { HOST: firmwareHost, PORT: firmwarePort } = KAIDU_FIRMWARE_URL;
  const [deviceId, devPublish, devSubscribe] = MokoProcessor.createMQTTConfig(
    deviceName,
    mac
  );
  
  return {
    mqttServerHost,
    mqttServerPort,
    firmwareHost,
    firmwarePort,
    firmwarefilepath,
    deviceId,
    appClientId,
    devSubscribe,
    devPublish,
  };
}