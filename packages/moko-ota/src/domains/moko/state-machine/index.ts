// import { isDeviceConnected } from '@kaidu/shared/features/ble-general';
import { assign, createMachine } from 'xstate';
import {
  getMokoBasicModule,
  createNativeEventEmitter,
} from '~/lib/NativeModules';
import {
  checkIsFirmwareFileFetchable,
  fetchLatestCompatibleFirmwareFileNameForMokoToKaidu,
} from '../../../features/firmware';
import { testMQTTConnection } from '../processors';
import { getAPPClientIDForMQTT } from '../../../features/firmware';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { BleManager } from '~/lib/ble-general';
import { checkIsKaidu } from '@kaidu/shared/features/ble';
import { checkUpdateResultOfDevice } from '@kaidu/shared/features/ble-kaidu';

const FINAL_STATE_ID = 'finalState';
const CHEKC_MQTT_CONNECT_STATE_ID = 'check-mqtt';

const MokoModule = getMokoBasicModule();
const eventEmitter = createNativeEventEmitter(MokoModule);

export const mokoUpdateStateMachine = createMachine(
  {
    id: 'moko-update',
    initial: 'init',
    predictableActionArguments: true,
    context: {
      errorMsg: '',
      msg: '',
      firmwareFileName: '',
      mqttClient: null,
      mqttConfig: null,
      scannerDeviceID: '',
      bleID: '',
      firmwareUpdateInputs: null,
    },
    states: {
      init: {
        on: {
          START: {
            target: 'verification',
          },
          MOKO_CONNECTED_TO_MQTT: {
            target: 'update',
            actions: assign({
              msg: 'Scanner is connected to MQTT',
              bleID: (context, event: any) => event?.data?.bleID,
              firmwareUpdateInputs: (context, event: any) =>
                event?.data?.firmwareUpdateInputs,
            }),
          },
        },
        after: {
          30000: {
            target: 'error',
            actions: assign({
              errorMsg:
                'Timeout: No message indicates scanner is connected to MQTT',
            }),
          },
        },
      },
      verification: {
        id: 'verification',
        initial: 'init',
        states: {
          init: {
            on: {
              START_VERFICATION: 'verifyFileName',
            },
          },
          verifyFileName: {
            invoke: {
              id: 'verify-file-name',
              src: (context, event) =>
                fetchLatestCompatibleFirmwareFileNameForMokoToKaidu(),
              onDone: [
                {
                  target: 'verifyFile',
                  actions: assign({
                    firmwareFileName: (context, event) => event.data,
                    msg: (context, event) =>
                      `Latest firmware file name: ${event.data}`,
                  }),
                  cond: (context, event) => {
                    const validationResult = event.data;
                    return validationResult;
                  },
                },
                {
                  target: 'error',
                  actions: assign({
                    errorMsg: 'Latest firmware file name is falsy',
                  }),
                },
              ],
              onError: {
                target: `error`,
                actions: assign({
                  errorMsg: 'Failed to fetch latest firmware file name',
                }),
              },
            },
            on: {
              NEXT: 'verifyFile',
            },
          },
          verifyFile: {
            invoke: {
              id: 'verify-file',
              src: (context, event) =>
                checkIsFirmwareFileFetchable(context?.firmwareFileName),
              onDone: [
                {
                  target: 'verifyMQTT',
                  cond: (context, event) => {
                    const validationResult = event.data;
                    // console.log("file: index.ts:37 ~ validationResult:", validationResult);
                    return validationResult;
                  },
                },
                {
                  target: 'error',
                  actions: assign({
                    errorMsg: 'Latest firmware file is not fetchable',
                  }),
                },
              ],
            },
          },
          verifyMQTT: {
            invoke: {
              id: 'verify-mqtt',
              // src: (context, event) => {
              //   const handleMQTTConnected = (nextState) => {
              //     if (nextState === 'connected') {
              //     }
              //   };
              //   return testMQTTConnection(handleMQTTConnected)
              // },
              src: (context, event) => (callback, onReceive) => {
                const handleMQTTConnected = (nextState) => {
                  if (nextState === 'connected') {
                    callback('MQTT_CONNECTED');
                  } else if (nextState === 'error') {
                    callback('MQTT_ERROR');
                  }
                };
                testMQTTConnection(handleMQTTConnected);
              },
            },
            on: {
              MQTT_CONNECTED: {
                target: 'success',
                actions: assign({
                  msg: 'MQTT broker is ready',
                }),
              },
              MQTT_ERROR: {
                target: 'error',
                actions: assign({
                  msg: 'Error: MQTT broker cannot be connected',
                }),
              },
            },
          },
          error: {},
          success: {},
        },
      },
      saveMQTTConfig: {
        id: 'saveMQTTConfig',
        initial: 'init',
        states: {
          init: {
            entry: ['CLEAR_CONTEXT'],
            on: {
              START_PREPARE_MQTT_CONFIG: {
                target: 'createMQTTConfig',
                actions: assign({
                  msg: `saving MQTT config on this app device. Light on the scanner should be blinking green.`,
                }),
              },
            },
          },
          createMQTTConfig: {},
        },
      },
      ble: {
        id: 'ble',
        initial: 'init',
        states: {
          init: {
            on: { NEXT: 'connect' },
          },
          connect: {
            invoke: {
              id: 'connect-to-ble',
              src: (context, event) => (callback, onReceive) => {
                const bleID = event.data;
                if (!MokoModule) {
                  return Promise.reject('MokoModule is not available');
                } else if (!bleID) {
                  const msg = 'BLE ID is not available';
                  console.warn('connect-to-ble ~ msg:', msg);
                  return Promise.reject(msg);
                }

                eventEmitter.addListener('onBLEConnect', (nativeEvent) => {
                  console.debug(
                    `Receive onBLEConnect nativeEvent:`,
                    nativeEvent
                  );
                  const isConnected = nativeEvent?.isConnected;
                  isConnected === 'true' && callback('BLE_CONNECTED')
                });

                const bleConnectioncallback = () => {
                  console.log('bleConnectioncallback');
                };
                return MokoModule.connectBLE(bleID, bleConnectioncallback);
                // return true;
              },
              onDone: [],
              onError: {
                target: 'error',
                actions: assign({
                  errorMsg:
                    'Failed to connect BLE. Please make sure the LED light is blinking green and retry.',
                }),
              },
            },
            on: {
              BLE_CONNECTED: {
                actions: assign({
                  msg: 'Bluetooth is connected and it is writing. LED light should be solid green. Please wait until the light changes',
                }),
              },
              BLE_CONNECT_FAIL: {
                target: 'error',
                actions: assign({
                  errorMsg:
                    'Failed to connect BLE. Please make sure the LED light is blinking green and retry.',
                }),
              },
            },
            after: {
              // set 20s timeout if the BLE doesn't connect & disconnect
              20000: {
                target: 'error',
                actions: assign({
                  errorMsg:
                    'BLE connect Timeout. Failed to get the BLE configuration success event from scanner. Please make sure the LED light is blinking green and retry. If it is in other state, press the button to reset and retry',
                  msg: '',
                }),
              },
            },
            exit: assign({
              msg: '',
            }),
          },
          error: {
            entry: ['DISCONNECT_BLE'],
          },
        },
        on: {
          BLE_SUCCESS: `#${CHEKC_MQTT_CONNECT_STATE_ID}.connect`,
        },
      },
      checkMQTT: {
        id: `${CHEKC_MQTT_CONNECT_STATE_ID}`,
        initial: 'init',
        states: {
          init: {
            // id: 'init-checkMQTT',
            on: { NEXT: 'connect' },
          },
          connect: {
            id: 'connectToMQTT',
            invoke: {
              id: 'connect-to-mqtt',
              src: (context, event) => (callback, onReceive) => {
                const appClientID = getAPPClientIDForMQTT();
                
                const { mqttConfig } = context || {};

                const deviceID = mqttConfig?.deviceId;
                const appToDeviceTopic = mqttConfig?.devSubscribe;
                const mqttServerHost = mqttConfig?.mqttServerHost;
                const port = mqttConfig?.mqttServerPort;
                const deviceToAppTopic = mqttConfig?.devPublish;
                console.log("checkDeviceMQTTConnection ~ deviceToAppTopic:", deviceToAppTopic);
                console.log("checkDeviceMQTTConnection ~ appToDeviceTopic:", appToDeviceTopic);

                return MokoModule.checkDeviceMQTTConnection(
                  mqttServerHost,
                  port,
                  appClientID,
                  appToDeviceTopic,
                  deviceID,
                  deviceToAppTopic
                );
              },
              onDone: {
                target: 'published',
                actions: assign({
                  mqttClient: (context, event) => event?.data,
                }),
              },
              onError: {
                target: 'error',
                actions: assign({
                  errorMsg:
                    'Failed to create and connect MQTT using this APP. Please make sure network is good and 1883 port is not blocked',
                }),
              },
            },
          },
          published: {},
          error: {},
        },
        on: {},
      },
      update: {
        id: 'updateFirmware',
        initial: 'init',
        states: {
          init: {
            on: {
              NEXT: 'publish',
            },
            entry: assign({
              msg: 'Firmware update will begin in 3s',
            }),
            after: {
              3000: {
                target: 'publish',
              },
            },
          },
          publish: {
            entry: assign({
              msg: 'Publishing Firmware update command',
            }),
            invoke: {
              id: 'publish-firmware-update-cmd',
              src: (context, event) => {
                activateKeepAwake();
                const { firmwareUpdateInputs } = context || {};
                if (!firmwareUpdateInputs) {
                  return Promise.reject('Firmware Update Inputs are missing');
                }

                const {
                  mqttServerHost,
                  mqttServerPort,
                  firmwareHost,
                  firmwarePort,
                  firmwarefilepath,
                  deviceId,
                  appClientId,
                  devSubscribe,
                  devPublish,
                } = firmwareUpdateInputs || {};

                return MokoModule.updateFirmware(
                  mqttServerHost,
                  mqttServerPort,
                  firmwareHost,
                  firmwarePort,
                  firmwarefilepath,
                  deviceId,
                  appClientId,
                  devSubscribe,
                  devPublish
                );
              },
              onDone: {
                target: 'wait',
                actions: assign({
                  msg: 'Firmware update command is sent.',
                }),
              },
              onError: {
                target: 'error',
                actions: assign({
                  errorMsg: 'Failed to publish firmware update command.',
                }),
              },
            },
            after: {
              30000: {
                target: 'error',
                actions: assign({
                  errorMsg:
                    'Timeout from publishing firmware update command. Please make sure the LED light is blinking green and retry.',
                }),
              },
            },
          },
          wait: {
            id: 'waiting-for-update',
            entry: assign({
              msg: 'Waiting for update. This will last for 30s',
            }),
            after: {
              30000: {
                target: 'scan',
              },
            },
          },
          scan: {
            id: 'scan-for-kaidu',
            entry: assign({
              msg: 'start scanning for devices until found the same device',
            }),
            invoke: {
              id: 'scanning',
              src: (context, event) => (callback, onReceive) => {
                const mac = context?.bleID;
                const onDevice = (device) => {
                  const { id, localName } = device;
                  // console.debug('Update scanned Device id: ' + id);
                  const isKaidu = checkIsKaidu(device);
                  if (id === mac && isKaidu) {
                    // if scanned device has the same MAC address and device is Kaidu now
                    console.debug('Found this Device with Name: ' + localName);
                    callback('NEXT');
                  }
                };
                // scan for devices until found the same device
                BleManager.scanBLEWithoutLimitTime(onDevice, (err) => {
                  console.error(err);
                  callback('ERROR');
                });
              },
              onError: {
                target: 'error',
                actions: assign({
                  errorMsg:
                    'Failed to scan BLE. BleManager cannot start scanning.',
                }),
              },
            },
            on: {
              NEXT: 'found',
              ERROR: {
                target: 'error',
                actions: assign({
                  errorMsg:
                    'Failed to scan BLE. Get an error from scanning callback.',
                }),
              },
            },
            after: {
              80000: {
                target: 'error',
                actions: assign({
                  errorMsg:
                    'Timeout from scanning. Cannot found the target scanner in 80s',
                }),
              },
            },
          },
          found: {
            id: 'found-kaidu',
            always: {
              target: 'checkVersion',
            },
            entry: ['STOP_SCANNING'],
          },
          checkVersion: {
            entry: assign({
              msg: 'Checking Kaidu firmware version',
            }),
            invoke: {
              id: 'check-version',
              src: (context, event) => {
                const mac = context?.bleID;
                return checkUpdateResultOfDevice(mac);
              },
              onDone: [
                {
                  target: `#${FINAL_STATE_ID}`,
                  cond: (context, event) => {
                    const isUpdateDone = event.data;
                    return isUpdateDone;
                  },
                },
                {
                  target: 'error',
                  actions: assign({
                    errorMsg:
                      'Firmware OTA is done but cannot get Kaidu firmware version from the scanner. Please power cycle the scanner.',
                  }),
                },
              ],
              onError: {
                target: 'error',
                actions: assign({
                  errorMsg:
                    'Failed to connect BLE and check the firmware version of Kaidu device.',
                }),
              },
            },
            after: {
              30000: {
                target: 'error',
                actions: assign({
                  errorMsg:
                    'Timeout from verifying the software version via BLE. Please power cycle the scanner and use Kaidu APP to verify.',
                }),
              },
            },
          },
          error: {
            // show error message
          },
        },
        on: {
          FIRMWARE_UPDATE_SUCCESS: {
            target: 'final',
            actions: assign({
              msg: 'Received firmware update success message from MQTT',
            }),
          },
          FIRMWARE_UPDATE_ERROR: {
            target: 'error',
            actions: assign({
              errorMsg: 'Failed to update firmware. Please try again.',
            }),
          },
        },
      },
      final: {
        // all done successfully
        id: FINAL_STATE_ID,
        entry: ['DEACTIVATE_KEEP_AWAKE'],
      },
      error: {
        id: 'error',
        entry: ['DISCONNECT_BLE'],
      },
    },
    on: {
      START_VERFICATION: {
        target: 'verification.verifyFileName',
        actions: assign({
          msg: 'Verifying the latest firmware file name',
          errorMsg: '',
          firmwareFileName: '',
        }),
      },
      START_BLE_CONNECT: {
        target: 'ble.connect',
        actions: assign({
          msg: 'connecting via Bluetooth. Please keep your device close to the scanner.',
          errorMsg: '',
        }),
      },
      START_MQTT_CONNECT: {
        target: 'checkMQTT.connect',
      },
      START_FIRMWARE_UPDATE: {
        target: 'update.publish',
        actions: assign({
          msg: 'updating firmware',
          bleID: (context, event) => event?.data?.bleID,
          firmwareUpdateInputs: (context, event: any) =>
            event?.data?.firmwareUpdateInputs,
        }),
      },
      CLEAR_CONTEXT: {
        actions: assign({
          msg: '',
          errorMsg: '',
          firmwareFileName: '',
          firmwareUpdateInputs: null,
        }),
      },
      UPDATE_MESSAGE: {
        actions: assign((context, event) => {
          return { msg: event.data };
        }),
      },
      UPDATE_MQTT_CONFIG: {
        actions: assign((context, event) => {
          return { mqttConfig: event.data };
        }),
      },
      UPDATE_SCANNER_DEVICE_ID: {
        actions: assign((context, event) => {
          return { scannerDeviceID: event.data };
        }),
      },
      GET_ERROR: {
        target: '#error',
        actions: assign((context, event) => {
          return { errorMsg: event.data };
        }),
      },
    },
  },
  {
    actions: {
      DISCONNECT_BLE: (context, event) => {
        const bleID = context?.bleID;
        MokoModule.disconnectBLE();
        bleID && BleManager.cancelConnection(bleID);
      },
      DEACTIVATE_KEEP_AWAKE: () => deactivateKeepAwake(),
      STOP_SCANNING: () => {
        console.debug('Stop scanning');
        return BleManager.stopScanning();
      },
      CLEAR_CONTEXT: assign({
        msg: '',
        errorMsg: '',
        firmwareFileName: '',
      }),
    },
  }
);
