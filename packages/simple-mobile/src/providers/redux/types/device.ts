
export interface DeviceStatistics {
  ble_scan_counter: number;
  mqtt_upload_counter: number;
  reboot_counter: number;
  beacon_status: string | null;
  source_id: string | null;
  start_time: string | null;
  end_time: string | null;
  [x: string]: any;
}


export interface CommonWritableConfig {
  // the common writable configuration in Kaidu Gateway & Kaidu Server
  device_name: string | null;
  wifi_ssid: string | null;
  wifi_password: string | null;
  mqtt_device_id: string | null;
  mqtt_device_certificate: string | null;
  [x: string]: any;
}

export interface FilledCommonWritableConfig {
  device_name: string;
  wifi_ssid: string;
  wifi_password: string;
  mqtt_device_id: string;
  mqtt_device_certificate: string;
}

export interface ConfigurationInServer extends CommonWritableConfig {
  mac_address: string | null;
  customer_name: string | null;
  building: string | null;
  location: string | null;
  floor: string | null;
}