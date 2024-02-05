// Operations on the native system of MOKO MK110 device
import { BleWriter } from '../ble-general';
import { handle } from '@kaidu/shared/utils';
import { Characteristic, Descriptor } from '../../types/interfaces';
import { get16BitsUUID, MOKO_UUIDS } from '@kaidu/shared/features/uuids';
import {
  createDeviceIdBase64,
  convertByteArrayToBase64,
  convertStringToByteArray,
  sliceIntoChunks,
} from '../data-operations';
import _ from 'lodash';

/**
 * @description write a base64 string to MK110 configure characteristic
 * @param  {} discoveredDevice
 * @param  {string} str
 * @return Promise <Response from MK110>
 */
export async function writeBase64ToMK110Configure(
  discoveredDevice,
  str: string
) {
  const resChars = await discoveredDevice.characteristicsForService(
    MOKO_UUIDS.PRIMARY_SERVICE_UUID
  );

  const writableChar = resChars.find(
    (char) =>
      get16BitsUUID(char.uuid) ===
      MOKO_UUIDS.CONFIGURE_CHARACTERISTIC_UUID_16BITS.toUpperCase()
  );

  const res = await BleWriter.writeBase64WithResponse(str, writableChar);

  if (res) {
    console.debug(`Get response from writing: ${str}`);
  }

  return res;
}

/**
 * @description compose first packet for writing device id
 * @param  {number} datakey
 * @param  {number} packetNum
 * @param  {number} length
 * @returns Uint8Array
 */
function composeFirstPacketByteArray(
  datakey: number,
  packetNum: number,
  length: number
): Uint8Array {
  const result = new Uint8Array(5);
  result[0] = datakey;
  result[1] = 0;
  result[2] = packetNum;
  result[3] = 0;
  result[4] = length;
  return result;
}

function getPacketNumber(deviceIdBytes: Uint8Array): number {
  return Math.floor(deviceIdBytes.length / 16);
}

/**
 * @param  {Uint8Array} bytes
 * @param  {number} key hexdecimal number
 * @param  {number} maxLength max length of data in bytes
 * @returns Uint8Array[] An array of packets populated with hexdecimal numbers. Each packet has at most 16 bytes
 */
export function composeDataPacketByteArray(
  bytes: Uint8Array,
  key: number,
  maxLength: number
): Uint8Array[] {
  bytes = bytes.slice(0, maxLength);
  // decompose data into 16 bytes chunks
  const arrays = sliceIntoChunks(bytes, 16);

  let header = new Uint8Array(4);
  header[0] = key;
  header[1] = 0;
  header[2] = 1; //packet sequence
  header[3] = arrays.length;
  let result = [new Uint8Array([...header, ...bytes])];
  if (bytes.length > 16) {
    //subcontract to 2 packets
    const arr2 = bytes.slice(16, 31);
    header[2] = 2;
    header[3] = arr2.length;
    result.push(new Uint8Array([...header, ...arr2]));
  }

  return result;
}

/**
 * @description write the device id to the MK110 device
 * @param  {} discoveredDevice
 * @param  {} deviceId
 */
export async function writeDeviceId(
  discoveredDevice,
  deviceId
): Promise<boolean> {
  // http://doc.mokotechnology.com/index.php?s=/1&page_id=160

  // prepare data
  const deviceIdBytes = convertStringToByteArray(deviceId);

  // APP Send（First Packet)
  const firstPacket = composeFirstPacketByteArray(
    0x82, // Data header Key: 0x82
    getPacketNumber(deviceIdBytes),
    deviceIdBytes.length
  );
  const firstPacketBase64 = convertByteArrayToBase64(firstPacket);
  const res = await writeBase64ToMK110Configure(
    discoveredDevice,
    firstPacketBase64
  );

  // get Device Response
  if (res) {
    // APP Send(Bluetooth Data Packet)
    const byteArraysForpacket = composeDataPacketByteArray(
      deviceIdBytes,
      0x04,
      32
    );
    const base64s = byteArraysForpacket.map((ba) =>
      convertByteArrayToBase64(ba)
    );

    const result = await Promise.all(
      base64s.map((base64) =>
        writeBase64ToMK110Configure(discoveredDevice, base64)
      )
    );

    // check Device Respond(Configuration Result)
    // console.debug(`Response result: ${inspect(result)}`);
    if (result) {
      return true;
    }
  }

  return false;
}

export async function fetchConfigurationDescriptors(
  discoveredDevice
): Promise<Array<Descriptor>> {
  const [characteristics, charErr]: [Array<Characteristic>, Error] =
    await handle(
      discoveredDevice.characteristicsForService(
        MOKO_UUIDS.PRIMARY_SERVICE_UUID
      )
    );
  if (charErr) throw new Error('fetch characteristics failed');

  // Find the configure characteristic
  const configureChar = characteristics.find(
    (characteristic) =>
      get16BitsUUID(characteristic.uuid) ===
      MOKO_UUIDS.CONFIGURE_CHARACTERISTIC_UUID_16BITS.toUpperCase()
  );

  const [descriptors, descErr]: [Array<Descriptor>, Error] = await handle(
    discoveredDevice.characteristicsForService(MOKO_UUIDS.PRIMARY_SERVICE_UUID)
  );
  if (descErr) throw new Error('fetch descriptors failed');

  return descriptors;
}
/**
 * @description write WiFi ssid and password to Moko Scanner
 * @param  {} discoveredDevice
 * @param  {string} ssid
 * @param  {string} password
 * @returns Promise<boolean>
 */
export async function writeWiFi(
  discoveredDevice,
  ssid: string,
  password: string
): Promise<boolean> {
  //write WiFi ssid
  // prepare data
  const ssidBytes = convertStringToByteArray(ssid);
  // first packet
  const firstPacket = composeFirstPacketByteArray(
    0x8b,
    getPacketNumber(ssidBytes),
    ssidBytes.length
  );
  const firstPacketBase64 = convertByteArrayToBase64(firstPacket);
  const res = await writeBase64ToMK110Configure(
    discoveredDevice,
    firstPacketBase64
  );

  if (res) {
    // send data packets when get Device Response
    // APP Send(Bluetooth Data Packet)
    const byteArraysForpacket = composeDataPacketByteArray(ssidBytes, 0x31, 32);
    const base64s = byteArraysForpacket.map((ba) =>
      convertByteArrayToBase64(ba)
    );
    const ssidResult = await Promise.all(
      base64s.map((base64) =>
        writeBase64ToMK110Configure(discoveredDevice, base64)
      )
    );
  }

  //write WiFi password
  // prepare data
  const pwBytes = convertStringToByteArray(password);
  // first packet
  const firstPwPacket = composeFirstPacketByteArray(
    0x8c,
    getPacketNumber(pwBytes),
    pwBytes.length
  );
  const firstPwPacketBase64 = convertByteArrayToBase64(firstPwPacket);
  const pwFirstRes = await writeBase64ToMK110Configure(
    discoveredDevice,
    firstPwPacketBase64
  );

  if (pwFirstRes) {
    // send data packets when get Device Response
    // APP Send(Bluetooth Data Packet)
    const byteArraysForpacket = composeDataPacketByteArray(ssidBytes, 0x32, 64);
    const base64s = byteArraysForpacket.map((ba) =>
      convertByteArrayToBase64(ba)
    );
    const pwResult = await Promise.all(
      base64s.map((base64) =>
        writeBase64ToMK110Configure(discoveredDevice, base64)
      )
    );
  }

  return true; //no errors
}
