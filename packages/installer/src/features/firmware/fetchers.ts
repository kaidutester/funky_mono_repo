import { fetchAsArrayBuffer } from '@kaidu/shared/features/axios';
import {
  fetchFirmwareVersionList,
  fetchLatestSoftwareVersion,
  findLatestCompatibleSoftwareVersionInFirmwareList
} from '@kaidu/shared/features/kaidu-server/kaidu-firmware-list';
import { isFilledArray } from '@kaidu/shared/utils';
import { KAIDU_FIRMWARE_BASE_URL_FOR_KAIDU_UPDATED } from './apis';
import { appendBinAsFileExtension } from './processors';
// import { compareVersions } from 'compare-versions';

/**
 * fetch firmware lsit and return the latest compatible software version for a hardware version
 */
export async function fetchLatestCompatibleFirmwareFileName(
  hardWareVersion: string,
): Promise<string | undefined> {
  if (!hardWareVersion) {
    throw new Error(`Hardware version is not provided`);
  }
  console.debug(`fetchLatestCompatibleSoftwareVersion starts for hw`, hardWareVersion);
  const firmwareList = await fetchFirmwareVersionList();

  if (!isFilledArray(firmwareList)) {
    // console.error(`fetchLatestCompatibleSoftwareVersion failed`);
    throw new Error('Fetched firmware list but no firmware list exist');
  }

  const latest = findLatestCompatibleSoftwareVersionInFirmwareList(
    hardWareVersion,
    firmwareList
  );
  console.log("fetchLatestCompatibleFirmwareFileName latestVersionFileName:", latest?.firmware_url);
  return latest?.firmware_url;
}

/**
 * Fetch Kaidu firmware file by file name
 */
export async function fetchFirmWare(
  version: string,
): Promise<ArrayBuffer> {
  const formattedVersion = appendBinAsFileExtension(version);
  const url = `${KAIDU_FIRMWARE_BASE_URL_FOR_KAIDU_UPDATED}/${formattedVersion}`; //e.g. http://dev2.deeppixel.ai/v0.1.5.bin
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
