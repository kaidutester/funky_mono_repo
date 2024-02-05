import {remote} from 'webdriverio';
import {
  TARGET_ANDROID_DEVICE_CAPABILITY,
  TARGET_IOS_DEVICE_CAPABILITY,
} from '../contants';

let driver;
describe('Authentication & Authorization', function () {
  beforeAll(async () => {
    require('expect-webdriverio').setOptions({wait: 5000});
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

  describe('Login', function () {
    describe('with register code', function () {
      it('sign-in with google using an existing account should display a message telling the user this email already exist in the system', async function () {
        
      });
    });

    it('should start scanning', async function () {});
  });
});
