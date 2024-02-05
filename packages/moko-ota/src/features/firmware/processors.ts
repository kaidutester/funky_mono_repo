import { getUniqueId } from 'react-native-device-info';

/**
 * @returns firmware file name, e.g. "v1.0.0.bin"
 */
export function formateFirmwareSoftwareVersion(str: string): string {
  if (str.startsWith('v')) {
    return str;
  } else {
    return 'v' + str;
  }
}

export function appendBinAsFileExtension(str: string): string {
  if (str.endsWith('.bin')) {
    return str;
  } else {
    return str + '.bin';
  }
}

/**
 * @description get an APP client ID which should be different for every mobile device
 * @returns {string} APP client ID, See https://www.npmjs.com/package/react-native-device-info#getuniqueid
 */
export function getAPPClientIDForMQTT(): string {
  return getUniqueId();
}