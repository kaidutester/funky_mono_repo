import {useKaiduConfigItem, useKaiduConfigByMac} from '@kaidu/shared/features/kaidu-server';

// should return data: mqtt certificate, mqtt device id, device name
export function useDeviceScreenData(mac: string) {
  const {
    data: serverConfig,
    isLoading: isServerConfigLoading,
    isError: isServerConfigError,
  } = useKaiduConfigItem(mac);
  const {data: kaiduDeviceConfig} = useKaiduConfigByMac(mac);

  // temp TODO: remove 
  const isMQTTDeviceIdAbsent =
    !isServerConfigLoading && (!serverConfig || !serverConfig?.mqtt_device_id);
  console.debug(`isMQTTDeviceIdAbsent ${isMQTTDeviceIdAbsent}`);
  
  if (isMQTTDeviceIdAbsent && kaiduDeviceConfig) {
    const {mqtt_device_id, mqtt_device_certificate} = kaiduDeviceConfig;
    console.debug(`Get new mqtt_device_id ${mqtt_device_id}`);
    return {
      data: {mqtt_device_id, mqtt_device_certificate},
      isLoading: false,
      isError: false,
    };
  }

  return {
    data: serverConfig,
    isLoading: isServerConfigLoading,
    isError: isServerConfigError,
  };
}
