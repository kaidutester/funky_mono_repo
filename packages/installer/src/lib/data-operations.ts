/**
 * @description Module: synchronous data operations
 */
import { Buffer } from 'buffer';
import _ from 'lodash';
import moment from 'moment';
import { TextEncoder } from 'web-encoding';
import {
  Characteristic, DeviceStatistics,
  KaiduDeviceStatus, ScannedDevice,
  Version
} from '../types/interfaces';
import { CustomersDeviceData } from '@kaidu/shared/features/kaidu-server';


const encoder = new TextEncoder();

export function isExistedDevice(
  device: ScannedDevice,
  arr: Array<ScannedDevice>,
): boolean {
  const found = arr.find(curDevice => curDevice.id === device.id);
  return found !== undefined;
}

export function addUniqueDevice(
  device: ScannedDevice,
  arr: Array<ScannedDevice>,
): Array<ScannedDevice> {
  if (!isExistedDevice(device, arr)) {
    return arr.concat(device);
  }
  return arr;
}

export function filterWritableCharacteristics(
  chars: Array<Characteristic>,
): Array<Characteristic> {
  return chars.filter(
    char => char.isWritableWithoutResponse || char.isWritableWithResponse,
  );
}

export function decodeBase64(str: string): string {
  return Buffer.from(str, 'base64').toString('utf8');
}

export function decodeBase64ToHex(str: string): string {
  const buffer = Buffer.from(str, 'base64');
  const result = Array.prototype.map
    .call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2))
    .join('');
  // console.debug(result);
  return result;
}

export function encodeBase64(str: string): string {
  return Buffer.from(str, 'utf8').toString('base64');
}

/**
 * @description encode bytes into base64
 * @param  {Uint8Array} bytes
 * @returns a string in Base64
 */
export function convertByteArrayToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

/**
 * @description convert user input device id to base64 format to be sent to MK110
 * @return a string in Base64
 */
export function createDeviceIdBase64(deviceId: string) {}

export function convertStringToByteArray(str: string): Uint8Array {
  if (!str) {
    return new Uint8Array([0]);
  }

  const bytes = encoder.encode(str);
  return bytes;
}

export function convertHexStringToByteArray(hexString: string): Uint8Array {
  let hexArray;
  if (hexString.length >= 2) {
    hexArray = hexString.match(/.{1,2}/g);
  } else {
    hexArray = [hexString];
  }

  return Uint8Array.from(hexArray.map(hex => parseInt(hex, 16)));
}

type IntegerArray =
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Uint8ClampedArray;

export function sliceIntoChunks<T>(arr: any[] | Uint8Array, chunkSize: number) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    // @ts-ignore
    res.push(chunk);
  }
  return res;
}
/**
 * @param  {string} str must be
 * @returns object
 */
export function processDeviceStatisticReading(
  str: string,
): DeviceStatistics | null {
  console.debug(`processDeviceStatisticReading is called. input: ${str}`);
  let json;
  try {
    json = JSON.parse(
      removeTraillingStringInJSON(
        str
          .replace(/\u0000d\":\"\"}/g, '')
          .replace(/\u0000/g, '')
          .normalize(),
      ),
    );
  } catch (error) {
    console.error(`processDeviceStatisticReading error: input is ${str}`);
    throw new Error(`Device Statistic Reading error. read value: ${str}`);
  }
  // const json = JSON.parse(
  //   (str.normalize()),
  // );

  // Convert each timestamp property to a readable date string;
  const oldTimestampProperties = ['start_timestamp', 'end_timestamp'];
  const newTimestampProperties = ['start_time', 'end_time'];
  const result = convertTimeStampPropertiesToReadableString(
    json,
    oldTimestampProperties,
    newTimestampProperties,
  );

  console.debug(`processDeviceStatisticReading finished.`);
  return result as DeviceStatistics;
}

export function removeTraillingStringInJSON(str: string): string {
  const left = (str.match(/{/g) || []).length;
  const right = (str.match(/}/g) || []).length;
  if (right > left) {
    let start = 0;
    for (let i = 0; i < left; i++) {
      start = str.indexOf('}', start);
    }
    return str.slice(0, start + 1);
  }
  return str;
}

function convertTimeStampValueToReadable(numString: string): string {
  const num = parseInt(numString);
  const m = moment.unix(num);
  return m.toString();
}

/**
 * @param  {object} obj must have all the properties in oldPropertyNames
 * @param  {Array<string>} oldPropertyNames
 * @param  {Array<string>} newPropertyNames
 */
export function convertTimeStampPropertiesToReadableString(
  obj: object,
  oldPropertyNames: Array<string>,
  newPropertyNames: Array<string>,
) {
  console.debug(`convertTimeStampPropertiesToReadableString is called`);
  // if obj doesn't have the properties, throw errors
  if (oldPropertyNames.some(prop => obj[prop] === undefined)) {
    throw new Error('The object does not have the asked properties');
  }

  const output = Object.assign({}, obj);

  for (let i = 0; i < oldPropertyNames.length; i++) {
    console.debug(`TimeStamp: ${output[oldPropertyNames[i]]}`);
    output[newPropertyNames[i]] = convertTimeStampValueToReadable(
      output[oldPropertyNames[i]],
    );
  }
  oldPropertyNames.forEach(oldProperty => delete output[oldProperty]);

  return output;
}

export function removeNULLvalues(str: string): string {
  return str.replace(/\u0000/g, '');
}

/**
 * @param  {string} base64Str
 * @returns object
 */
export function processVersionReading(base64Str: string): Version {
  console.debug(`processVersionReading: ${base64Str}`);
  const buffer = Buffer.from(base64Str, 'base64');
  // const buf = Buffer.from(buffer, 'ascii');
  const hw = buffer.slice(0, 2).join('.');
  const sw = buffer.slice(2).join('.');
  return {hw, sw};
}

/**
 * @param  {object[]|null|undefined} objects
 * @param  {string} property
 * @returns {object[]} sorted array of distinct property values
 */
export function getDistinctProperties(
  objects: object[] | null | undefined,
  property: string,
): Array<any> | null {
  if (objects === null || objects === undefined || objects.length === 0) {
    return null;
  }
  const uniques = [...new Set(objects.map(item => item[property]))]
    .filter(item => item !== null)
    .sort();
  // console.debug('getDistinctProperties: ' + uniques);
  return uniques;
}

export function formateHardwareVersion(str: string): string {
  if (str.startsWith('v')) {
    return str;
  } else {
    return 'v' + str;
  }
}

export function convertArrayBufferToBase64(arr: ArrayBuffer): string {
  const view = new Uint8Array(arr);
  // console.debug(`${view}`);
  return convertByteArrayToBase64(view);
}

export function splitNumberIntoTwoDigitsArray(num: number): number[] {
  let current = num;
  let result = [] as number[];
  let e: number;
  while (current > 0) {
    e = current % 100;
    result.push(e);
    current = Math.floor(current / 100);
  }
  return result.reverse();
}

/**
 * @description return the percentage (%)number
 * @param  {number} divider
 * @param  {number} dividend
 */
export function getPercentage(divider: number, dividend: number) {
  return Math.floor((dividend / divider) * 100);
}

/**
 * @description get the number of chunks
 * @param  {ArrayBuffer} bytes
 * @param  {number} chunkSize
 * @returns number
 */
export function getTotalChunks(bytes: ArrayBuffer, chunkSize: number): number {
  const totalSize = bytes.byteLength;
  // console.debug(`Firmware size: ${totalSize}`);
  const totalChunks = Math.ceil(totalSize / chunkSize);
  return totalChunks;
}

export function convertKaiduDeviceStatusNumToString(
  num: number,
): KaiduDeviceStatus {
  switch (num) {
    case 0:
      return 'NEW';
    case 1:
      return 'ACTIVATED';
    case 2:
      return 'CONFIGURED';
    case 3:
      return 'ONLINE';
    case 4:
      return 'OFFLINE';
    case 5:
      return 'DEACTIVATED';
    case 6:
      return 'BROKEN';
    default:
      return 'NEW';
  }
}

export function convertISO8601ToReadable(iso8601String: string): string {
  const result = moment(iso8601String, moment.ISO_8601).calendar().toString();
  return result;
}

// e.g."00-01-00-01-05" -> "hardware: v0.1; software: v0.1.5"
export function convertVersionToReadable(str: string): string {
  let result;
  const arr = str.split('-').map(n => parseInt(n));
  if (arr.length < 5) {
    throw new Error('Invalid Version string. Too short');
  }
  const hw = 'v' + arr.slice(0, 2).join('.');
  const sw = 'v' + arr.slice(2).join('.');
  result = `hardware: ${hw}; software: ${sw}`;
  return result;
}

export function filterByProperty(
  rows: any[],
  propertyName: string,
  propertyValue,
): any[] {
  if (propertyValue.toUpperCase() === 'ALL') {
    return rows;
  }
  const filtered = rows.filter(row => row[propertyName] === propertyValue);
  return filtered;
}

/**
 * @param  {Object[]} rows
 * @param  {string} property
 * @returns array of uniq values for given property
 */
export function getUniques(rows: Object[], property: string) {
  const uniqs = _.uniqBy(rows, property).map(item => item[property]);

  return uniqs;
}

type BFLMap = {
  building: string;
  floors: [
    floor: string,
    locations: [
      {
        location: string;
        wifis: [
          {
            id: string;
            customer_device_data_id: string;
            customer_id: string;
            building: string;
            location: string;
            floor: string;
            wifi_ssid: string;
            wifi_password: string;
          },
        ];
      },
    ],
  ];
};

export function createFormattedPreConfigMap(
  customerDeviceData: CustomersDeviceData[],
): BFLMap {
  let result;
  const buildings = getUniques(customerDeviceData, 'building');
  result = buildings.map(buildingItem => {
    // assign floors to each building
    const filteredBuilding = customerDeviceData.filter(
      item => item.building === buildingItem,
    );
    const uniqFloors = getUniques(filteredBuilding, 'floor');
    const floors = uniqFloors.map(floorValue => {
      const filteredFloor = filteredBuilding.filter(
        item => item.floor === floorValue,
      );
      const uniqLocations = getUniques(filteredFloor, 'location');
      const locations = uniqLocations.map(locationValue => {
        const filteredLocation = filteredFloor.filter(
          item => item.location === locationValue,
        ); //original data items with the same location
        const uniqWifis = uniqByWiFi(filteredLocation);

        return {location: locationValue, wifis: uniqWifis};
      });
      return {floor: floorValue, locations: locations};
    });
    // const filteredFloor = filteredBuilding

    return {building: buildingItem, floors};
  });
  // console.debug(`createBuildingFloorLocationMap ${helpers.inspect(result)}`);
  return result;
}

export function uniqByWiFi(
  customerDeviceDataList: CustomersDeviceData[],
): CustomersDeviceData[] {
  return _.uniqWith(
    customerDeviceDataList,
    (a, b) =>
      a.wifi_ssid === b.wifi_ssid && a.wifi_password === b.wifi_password,
  );
}

export function generateFakeMacAddress(uuid: string) {
  const temp = uuid.replace(/-/g, '');
  let result = temp.substring(0, 2);
  for (let i = 2; i < 12; i += 2) {
    result = result.concat(':', temp.substring(i, i + 2));
  }
  return result;
}

export function checkIsPreconfigIncluded(
  data: {
    building: string | null;
    location: string | null;
    floor: string | null;
    wifi_ssid: string | null;
    wifi_password: string | null;
    [x: string]: any;
  },
  preconfigList: CustomersDeviceData[],
) {
  //check building, floor, location, ssid, password
  const conditions = item => {
    return (
      item.wifi_ssid === data.wifi_ssid &&
      item.wifi_password === data.wifi_password &&
      item.building === data.building &&
      item.floor === data.floor &&
      item.location === data.location
    );
  };

  const founds = preconfigList.filter(conditions);

  if (founds.length > 0) {
    return founds[0];
  }

  return null;
}

export function updateObject(targetObj, name, value, resetNames) {
  let processedValue = value;
  if (typeof value === 'string') {
    processedValue = value.trim();
  }

  const updated = _.set(targetObj, name, processedValue);
  resetNames &&
    resetNames.forEach(resetName => {
      updated[resetName] = null;
    });

  return updated;
}