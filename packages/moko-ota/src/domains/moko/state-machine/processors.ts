import {
  createNativeEventEmitter,
  getMokoBasicModule,
} from '~/lib/NativeModules';

const MokoModule = getMokoBasicModule();
const eventEmitter = createNativeEventEmitter(MokoModule);