import {
  CommonWritableConfig,
  FilledCommonWritableConfig,
  ScannedDevice
} from '../../types/interfaces';

import {
  convertHexStringToByteArray
} from '../data-operations';


export function isFilledCommonWritableConfig(
  config: object,
): config is FilledCommonWritableConfig {
  const {
    device_name,
    wifi_ssid,
    wifi_password,
    mqtt_device_id,
    mqtt_device_certificate,
  } = config as CommonWritableConfig;

  return !!(
    device_name &&
    wifi_ssid &&
    wifi_password &&
    mqtt_device_id &&
    mqtt_device_certificate
  );
}

export function assignEmptyStringForWritableConfig(config: object): FilledCommonWritableConfig {
  const result = config as CommonWritableConfig;

  if (result.device_name === null || result.device_name === undefined) {
    result.device_name = '';
  }
  if (result.wifi_ssid === null || result.wifi_ssid === undefined) {
    result.wifi_ssid = '';
  }
  if (result.wifi_password === null || result.wifi_password === undefined) {
    result.wifi_password = '';
  }
  if (result.mqtt_device_id === null || result.mqtt_device_id === undefined) {
    result.mqtt_device_id = '';
  }
  if (result.mqtt_device_certificate === null || result.mqtt_device_certificate === undefined) {
    result.mqtt_device_certificate = '';
  }

  return result as FilledCommonWritableConfig;
}

export function parseMQTTCertificateToByteArray(certificate: string): Uint8Array {
  const temp = certificate.replace(/:/g, '');
  return convertHexStringToByteArray(temp);
}