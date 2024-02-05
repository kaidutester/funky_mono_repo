import { KaiduDeviceConfiguration } from '@kaidu/shared/features/kaidu-server';

export const EMPTY_KAIDU_DEVICE_CONFIG: Partial<KaiduDeviceConfiguration> = {
  device_name: null,
  wifi_ssid: null,
  wifi_password: null,
  // mqtt_device_id: undefined,
  // mqtt_device_certificate: null,
  // mac_address: null,
  customer_name: null,
  building: null,
  location: null,
  floor: null,
  kaidu_configuration_id: null,
  rssi_threshold: -80,
};
