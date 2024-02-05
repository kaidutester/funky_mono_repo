export interface Device {
  id: string;
  name?: string | null;
  isConnectable: boolean;
  serviceUUIDs: Array<string> | null;
  isConnected: () => Promise<boolean>;
  [x: string]: any;
}

export type Status = 'idle' | 'pending' | 'resolved' | 'rejected';

export interface GlobalStatus {
  status: Status;
  isScanning: boolean;
  isConnecting: boolean;
  [x: string]: any;
}

export interface Service {
  uuid: string;
  deviceID: string;
  characteristics: () => Promise<Array<Characteristic>>;
  [x: string]: any;
}

export interface Readable {
  read: () => Promise<any>;
  uuid: string;
  [x: string]: any;
}
export interface Characteristic extends Readable {
  serviceID: number;
  serviceUUID: string;
  isReadable: boolean;
  value?: any; //Type: Base64?
  [x: string]: any;
}

export interface Descriptor extends Readable {
  serviceID: number;
  serviceUUID: string;
  value?: any; //Type: Base64?
  [x: string]: any;
}

export interface WithValue {
  value: any;
  [x: string]: any;
}

export type WifiConfiguration = {
  ssid: string;
  password: string;
};

export enum ScannedDeviceCategory {
  KAIDU,
  MOKO,
  UNKNOWN,
}
export interface ScannedDevice {
  displayName?: string;
  id: string;
  name: string | null;
  manufacturerData: string;
  rssi?: string | number;
  mtu?: string | number;
  txPowerLevel?: number;
  category?: ScannedDeviceCategory;
}

export interface Filter {
  onlyKaidu: boolean;
  onlyMoko: boolean;
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

export interface Version {
  hw: string;
  sw: string;
}

// useful data retrieved from BLE readings
export interface KaiduDeviceFormattedData {
  mqttDeviceId: string;
  statistics: DeviceStatistics | null;
  mqttCert: string;
  version: Version | null;
}

export type KaiduDeviceStatus =
  | 'NEW'
  | 'ACTIVATED'
  | 'CONFIGURED'
  | 'ONLINE'
  | 'OFFLINE'
  | 'DEACTIVATED'
  | 'BROKEN';

export enum DEVICE_STATUS {
  NEW,
  ACTIVATED,
  CONFIGURED,
  ONLINE,
  OFFLINE,
  DEACTIVATED,
  BROKEN,
}

const len = Object.keys(DEVICE_STATUS).length;
export const DEVICE_STATUS_VALUES = Object.keys(DEVICE_STATUS).slice(len / 2);
export const DEVICE_STATUS_NUMS = Object.keys(DEVICE_STATUS).slice(0, len / 2);