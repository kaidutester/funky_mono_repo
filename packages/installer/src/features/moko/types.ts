
export type MokoMiniMQTTConfig = {
  host: string;
  port: string;
  cleanSession: boolean;
  connectMod: number; // int
  qos: number; // int
  keepAlive: number; // int
  clientId: string;
  uniqueId: string;
  username?: string;
  password?: string;
  caPath?: string;
  clientKeyPath?: string;
  clientCertPath?: string;
  topicSubscribe: string;
  topicPublish: string;
};

export type GeneralMokoMiniMQTTConfig = {
  host: string;
  port: string;
  cleanSession: boolean;
  connectMod: number; // int
  qos: number; // int
  keepAlive: number; // int
  caPath?: string;
  clientKeyPath?: string;
  clientCertPath?: string;
}

export type ChangeingMokoMiniMQTTConfig = {
  appClientId: string;
  deviceClientId: string;
  topicPublish: string;
  topicSubscribe: string;
  wifiSSID: string;
  wifiPassword: string;
  deviceId: string;
}

export type MokoDeviceType = 'MokoMini01' | 'MokoMini02' | 'MokoMini03' | 'MK110';
export enum MokoDeviceTypeEnum {
  MokoMini01 = 'MokoMini01',
  MokoMini02 = 'MokoMini02',
  MokoMini03 = 'MokoMini03',
  MK110 = 'MK110',
  UNKNOWN = 'UNKNOWN',
};

export type MokoMiniOTAConfig = {
  host: string;
  port: string;
  catalogue: string; // subpath to the firmware file
  appTopic: string; // the topic that mobile app should subscribe to
  deviceId: string; // the device id of the target plug
  mac: string; // the mac address of the target plug
  deviceType?: MokoDeviceTypeEnum; // the device type of the target plug
}