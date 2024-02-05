import {
  FIRMWARE_SUBPATH,
  FIRMWARE_HOST,
  FIRMWARE_FILE_BASE,
  FIRMWARE_PORT,
  CONFIG_SERVER,
  FIRMWARE_PROTOCOL,
  FIRMWARE_PATH
} from '@env';
// Firmware APIs on dev2


/**
 * Kaidu Firmware;
 * Target Firmware for Moko to Kaidu
 * For Moko to Kaidu firmware update
 */
export const KAIDU_FIRMWARE_URL = {
  HOST: FIRMWARE_HOST,  // e.g. '35.182.68.146'
  PORT: FIRMWARE_PORT, // e.g. '80'
  SUBPATH: FIRMWARE_SUBPATH, // e.g. '/v0.3.1.bin'
};
console.debug('KAIDU_FIRMWARE_URL', KAIDU_FIRMWARE_URL);

/**
 * API for getting latest firmware file name
 */
export const KAIDU_LATEST_FIRMWARE_VERSION_FOR_MOKO_UPDATE_API = `${CONFIG_SERVER}/kaidu_device_configuration/firmwareupdate/00%3A00%3A00%3A00%3A00%3A00/01000`;
/**
 * versions
 */
export const FIRMWARE_VERSIONS_JSON = `${FIRMWARE_FILE_BASE}/version.json`;
console.log("KAIDU_LATEST_FIRMWARE_VERSION_FOR_MOKO_UPDATE_API:", KAIDU_LATEST_FIRMWARE_VERSION_FOR_MOKO_UPDATE_API)


/**
 * e.g. https://dev2.deeppixel.ai, https://storage.googleapis.com/kaidu-firmware-storage
 */
export const KAIDU_FIRMWARE_BASE_URL_FOR_KAIDU_UPDATE = `${FIRMWARE_PROTOCOL}${FIRMWARE_HOST}${FIRMWARE_PATH}`;
console.debug("KAIDU_FIRMWARE_BASE_URL_FOR_KAIDU_UPDATE:", KAIDU_FIRMWARE_BASE_URL_FOR_KAIDU_UPDATE)


// Moko Mini Firmware file
export const MOKO_FIRMWARE_HOST = '47.104.172.169';
export const MOKO_FIRMWARE_PORT = '8080';
export const MOKO_MINI_FIRMWARE_SUBPATH = '/updata_fold/MKGW-mini.bin';
export const MOKO_MINI02_FIRMWARE_SUBPATH = '/updata_fold/MINI-02_V1.0.2.bin';

// Moko 110 Firmware file
export const MK110_FIRMWARE_SUBPATH = '/updata_fold/MK110_V1.3.1.bin';

/**
 * e.g. full url: `http://47.104.172.169:8080/updata_fold/MK110_V1.1.3.bin`,
 */
export const MOKO_FIRMWARE_URL = {
  HOST: MOKO_FIRMWARE_HOST,
  PORT: MOKO_FIRMWARE_PORT,
  SUBPATH: MK110_FIRMWARE_SUBPATH,
};

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