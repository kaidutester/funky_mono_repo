export type DataForWritingConfig = {
  kaidu_configuration_id: string | null;
  mqtt_device_id: string;
  mqtt_device_certificate: string;
  customer_id: string;
  customer_name?: string | null;
  mac_address: string;
  device_name: string | null;
  shouldUseKaiduConfigListAPI?: boolean;
  wifi_ssid?: string | null;
  wifi_password?: string | null;
  bleId?: string;
  apnName?: string;
  operator_name?: string;
};