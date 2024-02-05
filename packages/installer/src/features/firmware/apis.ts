import {
  FIRMWARE_SUBPATH,
  FIRMWARE_HOST,
  FIRMWARE_FILE_BASE,
  FIRMWARE_PORT,
} from '@env';
// Firmware APIs on dev2


/**
 * Kaidu Firmware;
 * Target Firmware for Moko to Kaidu
 * // For Moko to Kaidu firmware update
 */
export const KAIDU_FIRMWARE_URL = {
  HOST: FIRMWARE_HOST, 
  PORT: FIRMWARE_PORT,
  SUBPATH: FIRMWARE_SUBPATH,
};

console.debug('KAIDU_FIRMWARE_URL', KAIDU_FIRMWARE_URL);
// e.g.
// https://dev2.deeppixel.ai:443/v0.2.0.bin
// http://dev2.deeppixel.ai:80/v0.2.0.bin
// http://3.97.223.71:80/v0.2.1.bin
// export const KAIDU_FIRMWARE_URL = {
//   HOST: '35.182.68.146',
//   PORT: '80',
//   SUBPATH: '/v0.3.1.bin',
// };
export const KAIDU_FIRMWARE_BASE_URL_FOR_KAIDU_UPDATED = FIRMWARE_FILE_BASE;
export const FIRMWARE_VERSIONS_JSON = `${FIRMWARE_FILE_BASE}/version.json`;

// Moko Mini Firmware file
export const MOKO_FIRMWARE_HOST = '47.104.172.169';
export const MOKO_FIRMWARE_PORT = '8080';
export const MOKO_MINI_FIRMWARE_SUBPATH = '/updata_fold/MKGW-mini.bin';
export const MOKO_MINI02_FIRMWARE_SUBPATH = '/updata_fold/MINI-02_V1.0.2.bin';

// Moko 110 Firmware file
export const MK110_FIRMWARE_SUBPATH = '/updata_fold/MK110_V1.1.3.bin';

export const MOKO_FIRMWARE_URL = {
  HOST: MOKO_FIRMWARE_HOST,
  PORT: MOKO_FIRMWARE_PORT,
  SUBPATH: MK110_FIRMWARE_SUBPATH,
};
// full url: `http://47.104.172.169:8080/updata_fold/MK110_V1.1.3.bin`,

/**
 * full url: `http://47.104.172.169:8080/updata_fold/MKGW-mini.bin`,
 */
export const MOKO_MINI_FIRMWARE_URL = {
  HOST: MOKO_FIRMWARE_HOST,
  PORT: MOKO_FIRMWARE_PORT,
  SUBPATH: MOKO_MINI_FIRMWARE_SUBPATH,
};

/**
 * full url: `47.104.172.169:8080/updata_fold/MINI-02_V1.0.2.bin`,
 */
export const MOKO_MINI02_FIRMWARE_URL = {
  HOST: MOKO_FIRMWARE_HOST,
  PORT: MOKO_FIRMWARE_PORT,
  SUBPATH: MOKO_MINI02_FIRMWARE_SUBPATH,
};