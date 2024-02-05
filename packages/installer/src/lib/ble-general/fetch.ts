/**
 * @description Fetching operations to general BLE devices
 *
 */
import {
  Service,
  Characteristic,
  Device,
  Readable,
  WithValue,
} from '../../types/interfaces';
import { handle } from '@kaidu/shared/utils';
import {get16BitsUUID, getUUIDAllocatedValue, findBy16BitsUUID} from '@kaidu/shared/features/uuids';
import { decodeBase64} from '../data-operations';
import {Buffer} from 'buffer';
import {bleManager} from './ble-manager';

export async function fetchAllDescriptorsOfService(
  deviceUUID: string,
  deviceObj,
) {

  const [characteristics, resultErr] = await handle(deviceObj.characteristicsForService(deviceUUID));
  if (resultErr) throw new Error('fetchAllDescriptorsOfService failed');

  const [result, charError] = await handle(Promise.all(
    characteristics.map(char => char.descriptors()),
  ));
  if (charError) throw new Error('fetch characteristics of services failed');
  return result;
}

export async function fetchAllServiceUUIDs(deviceObj: Device) {
  const [services, resultErr] = await handle(deviceObj.services());
  if (resultErr) throw new Error('fetchServiceUUIDs failed');
  return services.map(service => service.uuid);
}

/**
 * @description retrieve all available service names
 * @return all available service names, return UNKNOWN for unknown service UUIDs
 */
async function fetchAllServiceNames(deviceObj: Device): Promise<string[]> {
  const serviceUUIDs = await fetchAllServiceUUIDs(deviceObj);
  return serviceUUIDs.map(uuid => getUUIDAllocatedValue(uuid));
}

/**
 * @description retrieve all available service information
 * @return Array of available services, include name, UUID, corresponding characteristic objects
 */
export async function fetchServiceInfo(deviceObj: Device): Promise<object[]> {
  const [services, resultErr] = await handle(deviceObj.services());
  if (resultErr) throw new Error('fetch services failed');

  const result = services.map(async service => {
    const [characteristics, charErr]: [Characteristic, any] = await handle(
      service.characteristics(),
    );

    if (charErr) throw new Error('fetch characteristics failed');

    return {
      uuid: service.uuid,
      name: getUUIDAllocatedValue(service.uuid),
      characteristics,
    };
  });

  return Promise.all(result);
}

/**
 * @description specifically get the 'Device information' characteristics
 * @return
 */
export async function fetchDeviceInformationCharacteristics(
  deviceObj: Device,
): Promise<Characteristic[] | null> {
  const [services, resultErr]: [Array<Service>, any] = await handle(
    deviceObj.services(),
  );
  if (resultErr) throw new Error('getServiceUUIDsOfDevice failed');

  const deviceInfoService = services.find(
    service => get16BitsUUID(service.uuid) === '180A',
  );

  if (deviceInfoService === undefined) {
    return null;
  }
  return deviceInfoService.characteristics();
}

export async function fetchAllCharacteristicsOfService(
  deviceObj: Device,
  uuid16bits: string,
): Promise<Characteristic[] | null> {
  const [services, resultErr]: [Array<Service>, any] = await handle(
    deviceObj.services(),
  );
  if (resultErr) throw new Error('fetch services failed');

  const deviceInfoService = services.find(
    service => get16BitsUUID(service.uuid) === uuid16bits,
  );

  if (deviceInfoService === undefined) {
    console.debug(`Service is not in the dictionary`);
    return null;
  }

  return deviceInfoService.characteristics();
}
/**
 * @description fetch the value of a readable object
 * @param  {Readable} readableObj
 * @returns Promise
 */
async function fetchReadableValue(readableObj: Readable): Promise<string> {
  if (readableObj.isReadable !== undefined && readableObj.isReadable) {
    const readChar = await handle(readableObj.read());
    //readChar.value: Base64
    return Buffer.from(readChar.value, 'base64').toString('utf8');
  } else {
    return 'unreadable';
  }
}

async function fetchReadableNameValueMap(
  readableObj: Readable,
): Promise<WithValue> {
  const [value, resultErr] = await handle(fetchReadableValue(readableObj));
  if (resultErr) throw new Error('fetchReadableNameValueMap failed');

  return {
    name: getUUIDAllocatedValue(readableObj.uuid),
    value: value,
  };
}

export async function fetchDeviceName(device: Device) {
  // service: 1800 - Generic Access
  const serviceUUIDs = await fetchAllServiceUUIDs(device);
  const serviceUUID = findBy16BitsUUID(serviceUUIDs, '1800');

  // characteristic: 2A00
  const [characteristics, charsErr]: [Characteristic[], Error] = await handle(
    device.characteristicsForService(serviceUUID),
  );
  if (charsErr)
    throw new Error(`fetch characteristics of ${serviceUUID} failed`);
  const uuids = characteristics.map(char => char.uuid);
  const charUUID = findBy16BitsUUID(uuids, '2A00');

  //readCharacteristicForService(serviceUUID, characteristicUUID, transactionId)
  const [deviceNameChar, resultErr]: [Characteristic, Error] = await handle(
    device.readCharacteristicForService(serviceUUID, charUUID),
  );
  if (resultErr) throw new Error(`fetch deviceName of ${device.id} failed`);

  return decodeBase64(deviceNameChar.value);
}
/**
 * @param  {string} deviceIdentifier
 * @param  {string} serviceUUID
 * @param  {string} characteristicUUID
 * @param  {string} transactionId?
 */
export async function readCharacteristicForDevice(deviceIdentifier:string, serviceUUID:string, characteristicUUID:string, transactionId?:string) {
  let result, resultErr;
  if (transactionId) {
    [result, resultErr] = await handle(bleManager.readCharacteristicForDevice(deviceIdentifier, serviceUUID, characteristicUUID, transactionId));
    if (resultErr) throw new Error(`readCharacteristicForDevice failed: ${resultErr.message}`);
  } else {
    [result, resultErr] = await handle(bleManager.readCharacteristicForDevice(deviceIdentifier, serviceUUID, characteristicUUID));
    if (resultErr) throw new Error(`readCharacteristicForDevice failed: ${resultErr.message}`);
  }

  return result;
}