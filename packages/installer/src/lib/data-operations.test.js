import * as operations from './data-operations';
import {Buffer} from 'buffer';
import {TextEncoder} from 'web-encoding';

const {
  encodeBase64,
  decodeBase64,
  convertStringToByteArray,
  convertByteArrayToBase64,
  convertHexStringToByteArray,
  processDeviceStatisticReading,
  processVersionReading,
  removeTraillingStringInJSON,
  splitNumberIntoTwoDigitsArray,
  updateObject,
} = operations;

test('encodeBase64: stackabuse.com -> c3RhY2thYnVzZS5jb20=', () => {
  expect(encodeBase64('stackabuse.com')).toBe('c3RhY2thYnVzZS5jb20=');
});

test('decodeBase64: c3RhY2thYnVzZS5jb20= -> stackabuse.com', () => {
  expect(decodeBase64('c3RhY2thYnVzZS5jb20')).toBe('stackabuse.com');
});

describe('convertStringToByteArray: string -> byte[]', () => {
  test('abc -> [97, 98, 99]', () => {
    expect(convertStringToByteArray('abc')).toEqual(
      new Uint8Array([97, 98, 99]),
    );
  });

  test('Asher MK110 -> [65, 115, 104, 101, 114, 32, 77, 75, 49, 49, 48]', () => {
    expect(convertStringToByteArray('Asher MK110')).toEqual(
      new Uint8Array([65, 115, 104, 101, 114, 32, 77, 75, 49, 49, 48]),
    );
  });
});

describe('byteArrayToBase64', () => {
  test('2A 03 31 30 33 00 01 01  ->  KgMxMDMAAQE=', () => {
    const bytes = convertHexStringToByteArray('2A03313033000101');
    expect(bytes).toEqual(new Uint8Array([42, 3, 49, 48, 51, 0, 1, 1]));

    expect(convertByteArrayToBase64(bytes)).toEqual('KgMxMDMAAQE=');
  });

  test('00 -> AA==', () => {
    const bytes = convertHexStringToByteArray('00');
    expect(bytes).toEqual(new Uint8Array([0]));

    expect(convertByteArrayToBase64(bytes)).toEqual('AA==');
  });

  test('2B 03 31 30 33 00 0D  31 39 32 2E 31 36 38 2E 31 2E 32 07 5B  ->  KwMxMDMADTE5Mi4xNjguMS4yB1s=', () => {
    const bytes = convertHexStringToByteArray(
      '2B03313033000D3139322E3136382E312E32075B',
    );
    expect(convertByteArrayToBase64(bytes)).toEqual(
      'KwMxMDMADTE5Mi4xNjguMS4yB1s=',
    );
  });

  test('should encode mqtt certificate', () => {
    const bytes = new Uint8Array([
      16, 89, 83, 11, 155, 47, 109, 217, 185, 0, 184, 14, 204, 39, 162, 28, 100,
      196, 86, 22, 127, 22, 206, 0, 31, 3, 58, 167, 138, 125, 83, 108,
    ]);
    expect(convertByteArrayToBase64(bytes)).toEqual(
      'EFlTC5svbdm5ALgOzCeiHGTEVhZ/Fs4AHwM6p4p9U2w=',
    );
  });
});

describe('processDeviceStatisticReading: raw string -> object', () => {
  test('Output should be a object with properties in the string', () => {
    const input =
      '{"ble_scan_counter":0,"mqtt_upload_counter":0,"reboot_counter":7,"beacon_status":"SM_ENABLE_MQTT","start_timestamp":1622135750,"end_timestamp":1622140176,"source_id":""}\u0000d":""}\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000';

    const desiredObject = {
      ble_scan_counter: 0,
      mqtt_upload_counter: 0,
      reboot_counter: 7,
      beacon_status: 'SM_ENABLE_MQTT',
      start_time: 'Thu May 27 2021 13:15:50 GMT-0400',
      end_time: 'Thu May 27 2021 14:29:36 GMT-0400',
    };

    expect(processDeviceStatisticReading(input)).toMatchObject(desiredObject);
  });

  test('should return string with paired curly braces', () => {
    const input = `{"ble_scan_counter":0,"mqtt_upload_counter":0,"reboot_counter":26,"beacon_status":"SM_ENABLE_MQTT","start_timestamp":0,"end_timestamp":18705,"source_id":"asher01"}er01"}`;
    const output = `{"ble_scan_counter":0,"mqtt_upload_counter":0,"reboot_counter":26,"beacon_status":"SM_ENABLE_MQTT","start_timestamp":0,"end_timestamp":18705,"source_id":"asher01"}`;
    expect(removeTraillingStringInJSON(input)).toBe(output);
  });
});

describe('process version reading', () => {
  test(
    String.raw`"\u0000\u0001\u0000\u0001\u0005" -> {hw: 0.1, sw:0.1.5}`,
    () => {
      const input = encodeBase64('\u0000\u0001\u0000\u0001\u0005');

      const desiredObject = {
        hw: '0.1',
        sw: '0.1.5',
      };

      expect(processVersionReading(input)).toMatchObject(desiredObject);
    },
  );
});

describe('splitNumberIntoTwoDigitsArray', () => {
  test(`should return an array with 2 digits per element`, () => {
    const input = 85455121556;

    const output = [8, 54, 55, 12, 15, 56];

    expect(splitNumberIntoTwoDigitsArray(input)).toEqual(output);
  });
});

test('updateObject', () => {
  const targetObj1 = {a: 'sdfsd', b: ' sdsd ', c: 'xxxx', d: null, e: null};
  const name = 'a';
  const value = 'wwww';
  const resetNames = ['c', 'e'];

  expect(updateObject(targetObj1, name, value, resetNames)).toEqual({
    a: 'wwww',
    b: ' sdsd ',
    c: null,
    d: null,
    e: null,
  });

  const targetObj2 = {a: 'sdfsd', b: ' sdsd ', c: 'xxxx', d: null, e: null};

  expect(updateObject(targetObj2, name, value)).toEqual({
    a: 'wwww',
    b: ' sdsd ',
    c: 'xxxx',
    d: null,
    e: null,
  });

});
