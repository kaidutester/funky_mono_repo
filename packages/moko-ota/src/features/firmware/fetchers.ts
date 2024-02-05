import { fetchAsArrayBuffer, getData, sendHeadRequest } from '@kaidu/shared/features/axios';
import {
  fetchLatestSoftwareVersion
} from '@kaidu/shared/features/kaidu-server/kaidu-firmware-list';
import { KAIDU_FIRMWARE_BASE_URL_FOR_KAIDU_UPDATE, KAIDU_LATEST_FIRMWARE_VERSION_FOR_MOKO_UPDATE_API } from './apis';
import { appendBinAsFileExtension } from './processors';

/**
 * fetch the latest firmware version file name for Moko to Kaidu update 
 */
export async function fetchLatestCompatibleFirmwareFileNameForMokoToKaidu(): Promise<string> {
  const url = KAIDU_LATEST_FIRMWARE_VERSION_FOR_MOKO_UPDATE_API;
  const result = await getData(url);
  console.debug(`latestFirmwareFileName: ${result}`);
  // return 'v0.4.1.bin';
  return result;
}

/**
 * 
 */
export async function checkIsFirmwareFileFetchable(fileName: string) {
  const url = `${KAIDU_FIRMWARE_BASE_URL_FOR_KAIDU_UPDATE}/${fileName}`;
  const res = await sendHeadRequest(url);
  const result = res.status === 200;
  console.log(`checkIsFirmwareFileFetchable for ${fileName} result:`, result)
  return result
}

/**
 * Fetch Kaidu firmware file by file name
 */
export async function fetchFirmWare(
  version: string,
): Promise<ArrayBuffer> {
  const formattedVersion = appendBinAsFileExtension(version);
  const url = `${KAIDU_FIRMWARE_BASE_URL_FOR_KAIDU_UPDATE}/${formattedVersion}`; //e.g. http://dev2.deeppixel.ai/v0.1.5.bin
  console.debug(`fetching FirmWare file at URL: ${url}`);

  return fetchAsArrayBuffer(url);
}

/**
 * 
 */
export async function fetchLatestVersionFirmware(): Promise<ArrayBuffer> {
  const version = await fetchLatestSoftwareVersion();
  return await fetchFirmWare(version);
}
