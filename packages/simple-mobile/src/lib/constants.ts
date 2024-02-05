import {versions} from '@kaidu/simple/package.json';
import {Platform} from 'react-native';

// Credentials
export const webClientId =
  '229716020794-d8jtegfbk2m7bajemqe2gg36if8c44fa.apps.googleusercontent.com';
export const iosClientId =
  '229716020794-so360f7v1ick585v7srmubpr7pu97js1.apps.googleusercontent.com';
/**
 * App version
 */
export const VERSION =
  Platform.OS === 'android' ? versions.android : versions.ios;

export const DISPLAY_NAME = `Kaidu`;

/**
 * Default BLE scanning filter
 */
export const DEFAULT_SCAN_FILTER = {
  onlyKaidu: true,
  onlyMoko: false,
};
