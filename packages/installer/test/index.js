// Don't use this file
const wdio = require('webdriverio');
const chai = require('chai');
const { expect, assert } = chai;

const package = 'com.safetrack.kaiduconfiguration';

const opts = {
  path: '/wd/hub',
  port: 4723,
  capabilities: {
    platformName: 'Android',
    platformVersion: '10',
    deviceName: 'Android Device',
    app: '/Users/asheryang/Documents/workplace/kaidu-android/android/app/build/outputs/apk/debug/app-debug.apk',
    appPackage: 'com.safetrack.kaiduconfiguration',
    appActivity: 'com.safetrack.kaiduconfiguration.MainActivity',
    automationName: 'UiAutomator2',
  },
  logLevel: 'error',
};

async function main() {
  describe('Create Android session', function () {
    let client;

    before(async function () {
      client = await wdio.remote(opts);
    });

    it('should create a session', async function () {
      const res = await client.status();
      assert.isObject(res.build);

      const current_package = await client.getCurrentPackage();
      assert.equal(current_package, package);
    });

    // it('should delete a seesion', async function () {
    //   const delete_session = await client.deleteSession();
    //   assert.isNull(delete_session);
    // });
  });

  describe('Login via google account', function () {
    let client;

    before(async function () {
      client = await wdio.remote(opts);
      // require('expect-webdriverio').setOptions({ wait: 5000 });
      await client.$('~Home Screen').waitForExist({ timeout: 30000 });
    });

    it('Init: should not login and display Google login button', async function () {
      const home = await client.$('~Home Screen');
      expect(home).to.exist;

      client.$('~Google Login').waitForDisplayed({ timeout: 8000 });
      const gBtn = await client.$('~Google Login');
      expect(gBtn).to.exist;
      gBtn.click();
      let source = await client.getPageSource();
      console.debug(source);
    });
  });
}

main();
