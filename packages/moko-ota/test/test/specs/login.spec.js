const wdio = require('webdriverio');

const opts = {
  path: '/wd/hub',
  port: 4723,
  capabilities: {
    platformName: 'Android',
    //   platformVersion: '10',
    deviceName: 'RV8G109AQLW',
    //   app: '/Users/asheryang/Documents/workplace/kaidu-android/android/app/build/outputs/apk/debug/app-debug.apk',
    appPackage: 'com.kaidu.mokoota',
    appActivity: 'com.kaidu.mokoota.MainActivity',
    //   automationName: 'UiAutomator2',
  },
  // logLevel: "error",
};

describe('Login via google account', function () {
  // let client;
  before(async function () {
    // client = await wdio.remote(opts);
    require('expect-webdriverio').setOptions({wait: 5000});

    const appRoot = await $('~app-root');
    expect(appRoot).toExist();
  });

  describe('Init', function () {
    it('should not login and display Google login button', async function () {
      // console.log(`browser: ${browser}`);
      // console.log(`driver: ${driver}`);

      const home = await $('~Home Screen');
      expect(home).toExist();

      const scanDeviceBtn = await $('~Scan Device');
      expect(scanDeviceBtn).not.toExist();
    });
  });

  describe('Pre-login preparation', function () {
    it('should login by press login button and start permission check if it is not granted', async function () {
      const gBtn = await $('~Google Login');
      await gBtn.waitForDisplayed({timeout: 14000});
      expect(gBtn).toBeDisplayed();
      await gBtn.click();

      const existingGoogleAccount = await $(
        '//hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.support.v7.widget.RecyclerView/android.widget.LinearLayout[1]',
      );
      await existingGoogleAccount.waitForDisplayed({timeout: 3000});
      await existingGoogleAccount.click();

      await browser.pause(5000);

      const btn = await $('~Request Location Permission');
      await btn.waitForDisplayed();
      await btn.click();
    });
  });

  describe('After login, allow permission', function () {
    before(async function () {
      // make sure permission popup is gone
      try {
        const btn = await $('~Request Location Permission');
        await btn.waitForDisplayed({timeout: 6000});
        await btn.click();

        await browser.pause(3500);

        const allowBtn = $(
          '//hierarchy/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.ScrollView/android.widget.LinearLayout/android.widget.LinearLayout/android.widget.LinearLayout[2]/android.widget.Button[1]',
        );
        await allowBtn.waitForDisplayed();
        await allowBtn.click();
      } catch (error) {
        console.error(error.message);
      }
    });

    it('should display scan device button after login and granted permission', async function () {
      const scanDeviceBtn = await $('~Scan Device');
      await scanDeviceBtn.waitForDisplayed();
    });
  });

  describe('start scan', function () {
    it('should display onlyKaidu', async function () {
      const scannerFilterText = $('~Scanner Filter State');
      await scannerFilterText.waitForDisplayed();
      const text = await scannerFilterText.getText();
      expect(text).toEqual('Only Kaidu');
    });

    it('should start scanning by press scan button', async function () {
      const scanDeviceBtn = await $('~Scan Device');
      await scanDeviceBtn.waitForDisplayed();
      await scanDeviceBtn.click();
    });

    // it('should show progress bar', async function () {
    //   const lp = await $('~Linear Progress Bar');
    //   await lp.waitForDisplayed({timeout: 3000});
    //   expect(lp).toBeDisplayed();
    // });
  });

  describe('select a scanned Kaidu scanner', function () {
    it('should connect & go to the device screen', async function () {
      await browser.waitUntil(
        async () => (await $$('~Kaidu Scanner Item').length) > 0,
        {
          timeout: 10000,
          timeoutMsg: 'expected some scanners to be displayed in 10s',
        },
      );

      const scannedKaidu = await $$('~Kaidu Scanner Item');

      await scannedKaidu[0].click();

      const beaconStatus = await $('~Beacon Status');
      await beaconStatus.waitForDisplayed({timeout: 20000});
      // console.log();
      const text = await beaconStatus.getText();
      expect(text).toHaveTextContaining('SM', 'MQTT');
    });
  });

});
