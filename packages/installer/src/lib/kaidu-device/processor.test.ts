import {parseMQTTCertificateToByteArray} from './processor';

describe('MQTT certificate from server should be converted to hex array', () => {
  test('', () => {
    const bytes = parseMQTTCertificateToByteArray('10:59:53:0b:9b:2f:6d:d9');
    expect(bytes).toEqual(new Uint8Array([16, 89, 83, 11, 155, 47, 109, 217]));
  });

  test('', () => {
    const bytes = parseMQTTCertificateToByteArray('10:59:53:0b:9b:2f:6d:d9:d9');
    expect(bytes).toEqual(
      new Uint8Array([16, 89, 83, 11, 155, 47, 109, 217, 217]),
    );
  });

  test('', () => {
    const bytes = parseMQTTCertificateToByteArray(
      '10:59:53:0b:9b:2f:6d:d9:b9:00:b8:0e:cc:27:a2:1c:64:c4:56:16:7f:16:ce:00:1f:03:3a:a7:8a:7d:53:6c',
    );
    expect(bytes).toEqual(
      new Uint8Array([
        16, 89, 83, 11, 155, 47, 109, 217, 185, 0, 184, 14, 204, 39, 162, 28,
        100, 196, 86, 22, 127, 22, 206, 0, 31, 3, 58, 167, 138, 125, 83, 108
      ]),
    );
  });
});
