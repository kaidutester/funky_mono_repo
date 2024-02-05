// Adapter for Moko native modules
// MokoModule: for MK110 plugs
// MokoProModule: for MKGW plugs
import { EventEmitter } from 'react-native';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';


// Steps to use Moko Native module
// 1. init
// 2. scan (performed by react-native-ble-plx)
// 3. connect
// 4. Setting MQTT to Device
// 4.1 Set Passowrd
// 5. use existing code to finish (tentative)

export const AndroidMokoModule =
  Platform.OS === 'android' && NativeModules?.MokoModule;

export function createNativeEventEmitter(MokoModule): EventEmitter {
  if (MokoModule) {
    return new NativeEventEmitter(NativeModules.ToastExample);
  } else {
    throw new Error('No available native module');
  }
}

export function getMokoProModule() {
  if (Platform.OS === 'android') {
    return NativeModules.MokoProModule;
  } else {
    return null;
  }
}

export function initMokoProModule() {
  const mokoProModule = getMokoProModule();
  if (mokoProModule) {
    mokoProModule.init();
    return mokoProModule;
  }
  return null;
}
