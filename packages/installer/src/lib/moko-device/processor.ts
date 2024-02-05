import { inspect } from '@kaidu/shared/utils';

export function createMQTTConfig(deviceName:string, mac:string) {
  const deviceId = `${mac}-deviceID`;
  const devPublish = `${deviceName}/${deviceId}/device_to_app`;
  const devSubscribe = `${deviceName}/${deviceId}/app_to_device`;

  const result = [deviceId, devPublish, devSubscribe];
  console.debug(`createMQTTConfig result: ${inspect(result)}`);

  return result;
}