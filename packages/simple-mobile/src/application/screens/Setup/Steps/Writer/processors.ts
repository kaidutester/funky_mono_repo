import {
  checkIsLaterOrEqualVersion,
  readHWFWVersion,
  // writeConfigToDevice,
  writeLTEConfigToDevice,
  writeWiFiCredentialToDevice,
  writeMQTTCredentialToDevice,
} from '@kaidu/shared/features/ble-kaidu';
import {
  connectAndDiscoverDevice,
  isDeviceConnected,
} from '@kaidu/shared/features/ble-general';
import {
  putKaiduConfig,
  getKeyOfKaiduConfigByMAC,
} from '@kaidu/shared/features/kaidu-server/kaidu-device-configuration';
import {deleteKaiduConfigListItem} from '@kaidu/shared/features/kaidu-server';
import {promiseWithTimeout} from '@kaidu/shared/utils';
import {defaultRSSI} from './constants';
import {DataForWritingConfig} from './types';
import {fetchLocationData} from '@kaidu/shared/domain/location';

// const putOption = { shouldTrimInputs: false };

const FIRMWARE_VERSION_SUPPORTS_USE_MQTT_FROM_SERVER = '0.4.0';

/**
 * Write config for a scanner hareware version 1
 * if firmware version >= FIRMWARE_VERSION_SUPPORTS_USE_MQTT_FROM_SERVER, write only Wi-Fi credentials via BLE
 * else write both MQTT credentials and Wi-Fi credentials
 */
export async function executeWrite(
  bleId: string,
  data: DataForWritingConfig,
  mutate,
) {
  console.debug(`Execute writing to server & plug`, bleId);
  // console.debug(`Input: ${inspect(data)}`);
  const {mac_address} = data || {};

  // compose request body
  const position_input = await fetchLocationData();
  console.log('file: processors.ts:43 ~ position_input:', position_input);

  const kaiduConfigInput = {
    ...data,
    ...defaultRSSI,
    position_input,
  };
  // console.log("file: processors.ts:43 ~ kaiduConfigInput:", kaiduConfigInput);

  //@ts-ignore
  const keyOfKaiduConfigByMAC = getKeyOfKaiduConfigByMAC(mac_address);
  console.log("file: processors.ts:54 ~ keyOfKaiduConfigByMAC:", keyOfKaiduConfigByMAC);
  const res1 = await mutate(
    keyOfKaiduConfigByMAC,
    putKaiduConfig(kaiduConfigInput),
  );

  console.log("file: processors.ts:60 ~ res1:", res1);
  const fetchedConfigId = res1?.kaidu_configuration_id;

  // write configuration data to BLE device
  // if get errors, delete kaidu_configuration_list and throw error
  try {
    const isConnected = await isDeviceConnected(bleId);
    if (!isConnected) {
      await connectAndDiscoverDevice(bleId);
    }

    const firmwareVersion = await readHWFWVersion(bleId);
    // console.debug(`Firmware version:`, firmwareVersion);
    const softwareVersion = firmwareVersion?.sw;
    const isBLEWritingSkippable = checkIsLaterOrEqualVersion(
      softwareVersion,
      FIRMWARE_VERSION_SUPPORTS_USE_MQTT_FROM_SERVER,
    );

    const res2 = await writeWiFiCredentialToDevice(bleId, data);
    console.log("file: processors.ts:80 ~ res2:", res2);
    if (!isBLEWritingSkippable) {
      await writeMQTTCredentialToDevice(bleId, data);
    }

    return res1 && res2;
  } catch (error: any) {
    console.error(`Catch executeWrite Error: ${error?.message}`);
    //XXXDC remove deleting because login was removed
    //fetchedConfigId && (await deleteKaiduConfigListItem(fetchedConfigId));

    throw new Error(
      'Failed to write configuration to the device. Please try again.',
    );
  }
}

/**
 *
 */
export async function executeWriteLTE(data: DataForWritingConfig, mutate) {
  // console.debug(`executeWriteLTE Input: ${inspect(data)}`);
  const {mac_address, bleId} = data || {};

  if (!mac_address || !bleId) {
    throw new Error('Device ID is missing in the input. Please try again.');
  }

  // add default rssi threshold
  const kaiduConfigInput = {...data, ...defaultRSSI};

  //@ts-ignore
  const res1 = await mutate(
    getKeyOfKaiduConfigByMAC(mac_address),
    putKaiduConfig(kaiduConfigInput),
  );
  // console.log("file: processors.ts:120 ~ executeWriteLTE ~ res1:", res1)
  const fetchedConfigId = res1?.kaidu_configuration_id;

  // write configuration data to BLE device
  // if get errors, delete kaidu_configuration_list and throw error
  try {
    const res2 = await writeLTEConfigToDevice(bleId, data);
    return res1 && res2;
  } catch (error: any) {
    console.error(`Catch executeWriteLTE Error`, error?.message);
    fetchedConfigId && (await deleteKaiduConfigListItem(fetchedConfigId));
    throw new Error(
      'Failed to write configuration to the device. Please try again.',
    );
  }
}

const writingTimeoutError = new Error(
  'Updating configuration took too long. Please reboot scanner and restart app, to try again.',
);

export async function executeWriteWithTimeout(bleId, data, mutate) {
  return await promiseWithTimeout(
    executeWrite(bleId, data, mutate),
    13000,
    writingTimeoutError,
  );
}

export async function executeLTEWriteWithTimeout(data, mutate) {
  return await promiseWithTimeout(
    executeWriteLTE(data, mutate),
    13000,
    writingTimeoutError,
  );
}
