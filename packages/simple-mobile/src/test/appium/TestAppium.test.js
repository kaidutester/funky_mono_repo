import {remote} from 'webdriverio';
import {TARGET_ANDROID_DEVICE_CAPABILITY, TARGET_IOS_DEVICE_CAPABILITY} from '../contants';

// eslint-disable-next-line no-undef
let driver;
jest.setTimeout(50000);

beforeAll(async () => {
  driver = await remote({
    path: '/wd/hub',
    host: 'localhost',
    port: 4723,
    capabilities: TARGET_IOS_DEVICE_CAPABILITY,
    logLevel: 'error',
  });
});

afterAll(async () => {
  if (driver) {
    await driver.deleteSession();
  }
});

const TARGET_SCANNER_MAC = 'A4:CF:12:5F:3A:A6';

describe('Pre-condition: logged-in', function () {
  test('Wait for scanned scanner', async () => {
    // await driver.pause(2000);

    const scanner = await driver.$('~Kaidu Scanner Item');
    const loader = await driver.$('~connecting to Bluetooth');
    await scanner.waitForExist();
    scanner.click();

    await driver.pause(1000);
    await loader.waitForExist({ reverse: true, timeout: 5000 });

    let cancelBtn = await driver.$('~Cancel Button');
    await cancelBtn.waitForExist({timeout: 8000});
    cancelBtn.click();
  });
});
