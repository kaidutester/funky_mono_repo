import {remote} from 'webdriverio';
import {TARGET_ANDROID_DEVICE_CAPABILITY, TARGET_IOS_DEVICE_CAPABILITY} from '../contants';

let driver;
describe('Scan Kaidu Scanners', function () {

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

  describe('start scan', function () {
    it('should display onlyKaidu', async function () {

    });

    it('should start scanning', async function () {
    });
  });

  describe('select a scanned Kaidu scanner', function () {
    it('should connect & go to the device screen', async function () {
      
    });

    it('should display scanner data', async function () {
      
    });
  });

  describe('after BLE connection, press Setup', function () {
    beforeAll(async function () {

    });

    it('', async function () {
      // let scanner = driver.element("//android.view.ViewGroup[@content-desc=\"Kaidu Scanner Item\"]/android.view.ViewGroup");
      // await scanner.waitForExist();
      // scanner.click();
      // let backBtn = driver.element("//android.widget.Button[@content-desc=\"Home, back\"]/android.widget.ImageView");
      // await backBtn.waitForExist();
      // backBtn.click();
    });
  });
});

