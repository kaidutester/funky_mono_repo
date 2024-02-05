import {Characteristic} from '../../types/interfaces';
import {handle} from '../../utils/helper';
import {encodeBase64} from '../data-operations';
import {findBy16BitsUUID} from '../uuids/uuid-operations';
import {fetchAllServiceUUIDs} from './fetch';
import {bleManager} from './ble-manager';

/**
 * @param  {string} human-readable string
 * @param  {Characteristic} writableChar
 * @return Promise <Response from the written characteristic>
 */
export async function writeTextWithResponse(
  str: string,
  writableChar: Characteristic,
) {
  const base64Str = encodeBase64(str);
  const [res, resultErr] = await handle(
    writableChar.writeWithResponse(base64Str),
  );
  if (resultErr) throw new Error('Writting characteristic failed');
  return res;
}


/**
 * @param  {string} str Base64 string
 * @param  {Characteristic} writableChar a writable characteristic
 * @return {Promise} Response from the written characteristic
 */
export async function writeBase64WithResponse(
  str: string,
  writableChar: Characteristic,
) {
  const [res, resultErr] = await handle(writableChar.writeWithResponse(str));
  if (resultErr) throw new Error('Writting characteristic failed');
  return res;
}

export async function writeWithoutResponse(
  str: string,
  writableChar: Characteristic,
) {}

export async function writeDeviceName(device, name: string) {
  const valueBase64 = encodeBase64(name);

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

  // writeCharacteristicWithResponseForService(serviceUUID, characteristicUUID, valueBase64, transactionId)
  const [result, resultErr]: [Characteristic, Error] = await handle(
    device.writeCharacteristicWithResponseForService(
      serviceUUID,
      charUUID,
      valueBase64,
    ),
  );
  if (resultErr) throw new Error(`fetch deviceName of ${device.id} failed`);

  return result;
}


export async function writeCharacteristicWithResponseForDevice(
  deviceId,
  serviceUUID,
  characteristicUUID,
  base64Value,
) {
  const [result, resultErr] = await handle(
    bleManager.writeCharacteristicWithResponseForDevice(
      deviceId,
      serviceUUID,
      characteristicUUID,
      base64Value,
    ),
  );
  if (resultErr)
    throw new Error(
      'writeCharacteristicWithResponseForDevice Error:' + resultErr.message,
    );

  return result;
}