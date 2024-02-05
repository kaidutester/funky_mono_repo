import { generateDeviceClientID } from '../../../domains/moko/processors';
import { getAPPClientIDForMQTT } from '../../../features/firmware';
import { MokoProcessor } from '~/lib/moko-device';

/**
 * create MQTT configuration data
 */
export function generateMQTTConfig(data: {deviceName: string, mac: string, wifi: any}, mqttServer) {
  const { deviceName, mac, wifi } = data || {};
  const { ssid, password } = wifi || {};
  
  const appClientId = getAPPClientIDForMQTT();
  const [deviceId, devPublish, devSubscribe] = MokoProcessor.createMQTTConfig(
    deviceName,
    mac
  );
  const deviceClientId = generateDeviceClientID(appClientId, deviceId);

  return {
    deviceId,
    devPublish,
    devSubscribe,
    deviceClientId,
    ssid,
    password,
    ...mqttServer,
  };
}