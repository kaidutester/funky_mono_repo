import {
  KAIDU_DEVICE_CHARACTERISTICS_UUIDS,
  KAIDU_UUIDS
} from '@kaidu/shared/features/ble-kaidu';
import { handle, inspect, waitTimeout } from '@kaidu/shared/utils';
import {
  DeviceStatistics,
  Version,
  WithValue
} from '~/types/interfaces';
import { BleFetcher, BleWriter } from '../ble-general';
import {
  connectAndDiscoverDevice
} from '../ble-general/ble-manager';
import {
  convertByteArrayToBase64,
  convertStringToByteArray,
  decodeBase64,
  encodeBase64,
  processDeviceStatisticReading,
  processVersionReading
} from '../data-operations';
import { assignEmptyStringForWritableConfig } from './processor';

const waitingInterval = 500;

/**
 * 
 * @param deviceId 
 * @param config 
 * @returns 
 */
export async function writeConfigToDevice(deviceId: string, config: any) {
  // use device id, service uuid, characteristic uuid to write data
  const filled = assignEmptyStringForWritableConfig(config);

  const { wifi_ssid, wifi_password, mqtt_device_certificate, mqtt_device_id } =
    filled;
  console.debug(`writeConfigToDevice: ${inspect(filled)}`);

  const discoveredDevice = await connectAndDiscoverDevice(deviceId);

  const readBeforeWrite = async (charID, formatedData, hasNext = true) => {
    const existing = await discoveredDevice.readCharacteristicForService(
      KAIDU_UUIDS.WIFI_SCANNER.CONFIGURATION_SERVICE_UUID,
      charID
    );

    let written = true;
    if (existing.value !== formatedData) {
      written =
        await discoveredDevice.writeCharacteristicWithResponseForService(
          KAIDU_UUIDS.WIFI_SCANNER.CONFIGURATION_SERVICE_UUID,
          charID,
          formatedData
        );

      if (hasNext) {
        await waitTimeout(waitingInterval);
      }
    }

    return written;
  };

  const wifiSsid = await readBeforeWrite(
    KAIDU_DEVICE_CHARACTERISTICS_UUIDS.WIFI_SSID,
    convertByteArrayToBase64(convertStringToByteArray(wifi_ssid))
  );

  const wifiPw = await readBeforeWrite(
    KAIDU_DEVICE_CHARACTERISTICS_UUIDS.WIFI_PASSWORD,
    convertByteArrayToBase64(convertStringToByteArray(wifi_password))
  );

  const mqttDeviceId = await readBeforeWrite(
    KAIDU_DEVICE_CHARACTERISTICS_UUIDS.MQTT_DEVICE_ID,
    convertByteArrayToBase64(convertStringToByteArray(mqtt_device_id))
  );

  const mqttCert = await readBeforeWrite(
    KAIDU_DEVICE_CHARACTERISTICS_UUIDS.MQTT_CERTIFICATE,
    encodeBase64(mqtt_device_certificate),
    false
  );

  return [wifiSsid, mqttDeviceId, wifiPw, mqttCert];
}

/**
 * @description read wifi ssid from kaidu ble device
 * @param  {string} deviceId
 */
export async function readWiFiSSID(deviceId: string): Promise<string> {
  return await readConfigureCharacteristic(
    deviceId,
    KAIDU_DEVICE_CHARACTERISTICS_UUIDS.WIFI_SSID
  );
}

export async function readWiFiPassword(deviceId: string) {
  return await readConfigureCharacteristic(
    deviceId,
    KAIDU_DEVICE_CHARACTERISTICS_UUIDS.WIFI_PASSWORD
  );
}

export async function readConfigureCharacteristic(
  deviceId: string,
  charId: string
): Promise<string> {
  //get configuration services
  // const services = await fetchServicesForDevice(deviceId);
  // const configureService = services.find(
  //   service => service.uuid === KAIDU_UUIDS.WIFI_SCANNER.CONFIGURATION_SERVICE_UUID,
  // );
  // if (configureService === undefined) {
  //   throw new Error(`Device ${deviceId} doesn't have CONFIGURATION service`);
  // }

  const [res, resultErr]: [WithValue & { value: string }, Error] = await handle(
    BleFetcher.readCharacteristicForDevice(
      deviceId,
      KAIDU_UUIDS.WIFI_SCANNER.CONFIGURATION_SERVICE_UUID,
      charId
    )
  );

  if (resultErr) throw new Error(`Failed to read characteristic: ${charId}`);

  return decodeBase64(res.value);
}
/**
 * @description read
 * @param  {string} deviceId
 * @returns Promise<DeviceStatistics | null > return processed values or null if error
 */
export async function readDeviceStatistics(
  deviceId: string,
  trials: number = 3
): Promise<DeviceStatistics | null> {
  let res, fetchErr;

  while (!res && trials > 0) {
    [res, fetchErr] = await handle(
      readConfigureCharacteristic(
        deviceId,
        KAIDU_DEVICE_CHARACTERISTICS_UUIDS.DEVICE_STATISTICS
      )
    );
    trials--;
    console.debug(`fetch device stats remaining trials: ${trials}.`);
  }

  if (!res)
    throw new Error(`Read Device Statistics failed: ${fetchErr.message}`);

  let result: DeviceStatistics | undefined | null;
  let resultErr: Error | undefined;
  while (!result && trials > 0) {
    try {
      result = processDeviceStatisticReading(res);
    } catch (error) {
      trials--;
      resultErr = error;
    }
  }

  if (!result) {
    throw resultErr;
  }

  return result;
}

export async function readHWFWVersion(deviceId: string): Promise<Version> {
  try {
    const res = await BleFetcher.readCharacteristicForDevice(
      deviceId,
      KAIDU_UUIDS.WIFI_SCANNER.OTA_SERVICE_UUID,
      KAIDU_DEVICE_CHARACTERISTICS_UUIDS.HW_SW_VERSION
    );
    console.debug(`readHWFWVersion base64 value: ${res.value}`);
    const version = processVersionReading(res.value);
    // console.debug(inspect(value));
    return version;
  } catch (err) {
    return { hw: '0', sw: '0' };
  }
}

export async function writeSingleFirmwareChunk(deviceId, base64) {
  const [result, resultErr] = await handle(
    BleWriter.writeCharacteristicWithResponseForDevice(
      deviceId,
      KAIDU_UUIDS.WIFI_SCANNER.OTA_SERVICE_UUID,
      KAIDU_DEVICE_CHARACTERISTICS_UUIDS.OTA_FIRMWARE,
      base64
    )
  );
  if (resultErr)
    throw new Error(`writeFirmwareChunk Error: ${resultErr.message}`);

  return result;
}

export async function subscribeOtaCharacteristic(
  discoveredDevice,
  listener: (error?: Error, characteristic?: any) => void
) {
  const transactionId = 'test' + Math.random() * 10000;
  return await discoveredDevice.monitorCharacteristicForService(
    KAIDU_UUIDS.WIFI_SCANNER.OTA_SERVICE_UUID,
    KAIDU_DEVICE_CHARACTERISTICS_UUIDS.OTA_FIRMWARE,
    listener,
    'characteristicvaluechanged'
  );
}

export async function sendSingleFirmwareChunk(deviceId, data) {
  // if writeFirmwareChunk throws error, must disconnect before writing new data
  let errorDepth = 0;
  let result, resultErr;
  while (errorDepth < 10) {
    [result, resultErr] = await handle(
      writeSingleFirmwareChunk(deviceId, data)
    );
    // await sleep(200);
    if (result) {
      break;
    } else {
      console.error(resultErr.message);
      errorDepth++;
      resultErr = null;
    }
  }
  if (errorDepth >= 10) {
    throw new Error('Max error depth reached when writing firmware chunks');
  }
}