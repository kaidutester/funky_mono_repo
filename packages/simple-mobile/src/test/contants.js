export const TARGET_SCANNER_MAC = 'A4:CF:12:5F:3A:A6';

export const TARGET_ANDROID_DEVICE_CAPABILITY = {
  platformName: 'Android', // must be consistent with the device
  platformVersion: '10', // must be consistent with the device
  deviceName: 'RV8G109AQLW', // must be consistent with the device
  appium: {connectHardwareKeyboard: true},
  // appPackage: 'com.safetrack.kaidusimple',
  // appActivity: 'com.safetrack.kaidusimple.MainActivity',
  // automationName: 'UiAutomator2',
  // automationName: "XCUITest",
  // app: "org.reactjs.native.example.LearnRnE2eTest", // this is for open specify app
  // udid: process.env.IOS_DEVICE_UUID,
  // xcodeOrgId: "xxx",
  // xcodeSigningId: "Apple Development"
};

/**
 * Values should be updated by the used real device
 */
export const TARGET_IOS_DEVICE_CAPABILITY = {
  platformName: 'iOS',
  platformVersion: '16.1',
  deviceName: 'Asher Phone',
  // appium: {connectHardwareKeyboard: true},
  bundleId: 'com.safetrack.kaidusimple',
  automationName: 'XCUITest',
  udid: '00008030-000138690EFA402E',
  xcodeSigningId: 'iPhone Developer',
  xcodeOrgId: 'HW348SJA68',
};
