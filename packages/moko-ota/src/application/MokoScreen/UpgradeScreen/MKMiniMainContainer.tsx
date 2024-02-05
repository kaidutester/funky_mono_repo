import React, { useEffect, useState } from 'react';
import {
  getAPPClientIDForMQTT,
  KAIDU_FIRMWARE_URL,
  // MOKO_MINI_FIRMWARE_URL,
  // MOKO_MINI02_FIRMWARE_URL
} from '~/features/firmware';
import { sleep } from '@kaidu/shared/utils';
import { getMokoProModule } from '~/lib/NativeModules';
import { MokoMiniOTAConfig } from '../../../domains/moko/types';
import {
  generateDeviceID,
  generateDeviceToAppTopic,
} from '../../../domains/moko/processors';
import { inspect, promiseWithTimeout } from '@kaidu/shared/utils';
import { DEFAULT_ERROR } from '@kaidu/shared/features/error';
import { AsyncLifecycle } from '@kaidu/shared/types';
import { useNavigation } from '@react-navigation/native';
import { PendingView } from '../views/PendingView';
import { ErrorView } from '../views/ErrorView';
import { MOKO_MINI_UPGRADE_RUNNING_TEXT } from '../constants';
import { SuccessView } from '../views/SuccessView';
import { STACK_SCREENS } from '~/navigation/routes';
import { deactivateKeepAwake } from 'expo-keep-awake';
import { checkUpdateResultOfDevice } from '@kaidu/shared/features/ble-kaidu';
import { cancelConnection } from '@kaidu/shared/features/ble-general';
import { MokoDeviceTypeEnum } from '../../../domains/moko/types';
import { useSelector } from 'react-redux';
import { selectMokoGlobalConfig } from '../../../domains/moko/providers/mokoSlice';
// import useAsyncFn from 'react-use/lib/useAsyncFn';

/**
 * 
 */
async function sendFirmwareUpdateMsgForMKMini(config: MokoMiniOTAConfig) {
  const { host, port, catalogue, deviceId, appTopic, mac, deviceType } = config || {};

  console.debug('sendFirmwareUpdateMsgForMKMini config: ', inspect(config));

  const mokoProModule = getMokoProModule();
  await sleep(2000);

  await mokoProModule.isAppConnectedToMQTT();
  await sleep(8 * 1000);

  // publish OTA message to MQTT server
  console.warn('publish OTA message to MQTT server');
  // throw new Error('Test');

  await mokoProModule.startUpdate(
    host,
    parseInt(port),
    catalogue,
    deviceId,
    appTopic,
    mac,
    deviceType
  );
  console.debug('sendFirmwareUpdateMsgForMKMini finished');
  return;
}

const timeoutError = new Error('Publish firmware update message timed out. Please try again later.');
const { HOST, PORT, SUBPATH } = KAIDU_FIRMWARE_URL || {};


/**
 * MKMiniMainContainer for upgrade
 */
export function MKMiniMainContainer({ mac, ...optionals }) {
  const { deviceType = MokoDeviceTypeEnum.MokoMini01, ...rest } = optionals;

  //Process Props
  const appClientId = getAPPClientIDForMQTT();
  const deviceId = generateDeviceID(mac);
  const appTopic = generateDeviceToAppTopic(deviceId, appClientId);


  //Global state
  const {
    firmwarefilepath
  } = useSelector(selectMokoGlobalConfig);
  
  const firmware = {
    host: HOST,
    port: PORT,
    catalogue: firmwarefilepath,
  };
  const input: MokoMiniOTAConfig = { ...firmware, appTopic, deviceId, mac, deviceType };

  
  //states
  const [status, setStatus] = useState<AsyncLifecycle | 'verify'>(AsyncLifecycle.IDLE);
  const [error, setError] = useState(DEFAULT_ERROR);

  // Hooks
  // const [state, execute] = useAsyncFn(sendFirmwareUpdateMsgForMKMini, [mac, deviceType]);
  const navigation = useNavigation();

  const handleError = (err) => {
    setError(err);
    setStatus(AsyncLifecycle.REJECTED);
  }

  const handleFirmwareUpdate = async () => {
    setStatus(AsyncLifecycle.PENDING);

    promiseWithTimeout(sendFirmwareUpdateMsgForMKMini(input), 25 * 1000, timeoutError)
      .then(() => {
        // console.debug('MK Mini firmware update process is fulfilled');
        setStatus('verify');
      })
      .catch((err) => {
        handleError(err);
        console.debug('MK Mini firmware update process is rejected');
      });
  };

  useEffect(() => {
    console.debug('MK Mini firmware update process is started');
    if (status === AsyncLifecycle.IDLE) {
      handleFirmwareUpdate().catch(handleError);
    }

    if (status === 'verify') {
      const timeoutError = new Error('Firmware update timed out. Please try again later.');
      sleep(10 * 1000).finally(() => {
        promiseWithTimeout(checkUpdateResultOfDevice(mac), 50 * 1000, timeoutError).then(isUpdateDone => {
          isUpdateDone ? setStatus(AsyncLifecycle.FULFILLED) : setStatus(AsyncLifecycle.REJECTED);;
        }).catch(handleError);
      });
    }

    if (status === AsyncLifecycle.FULFILLED) {
      deactivateKeepAwake();
    }

    if (status === AsyncLifecycle.REJECTED) {
      deactivateKeepAwake();
      cancelConnection(mac);
    }
  }, [status]);

  const handleCancel = () => {
    cancelConnection(mac);
    setStatus(AsyncLifecycle.IDLE);
    navigation.goBack();
    return;
  };

  const handleNext = () => {
    setStatus(AsyncLifecycle.IDLE);
    navigation.navigate({
      name: STACK_SCREENS.HOME,
    });
  };

  return (
    <>
      {status === AsyncLifecycle.PENDING ? (
        <PendingView
          onCancel={handleCancel}
          text={MOKO_MINI_UPGRADE_RUNNING_TEXT}
        />
      ) : null}
      {status === 'verify' ? (
        <PendingView
          onCancel={handleCancel}
          text={'Checking firmware update result...'}
        />
      ) : null}
      {status === AsyncLifecycle.REJECTED ? (
        <ErrorView
          text={error?.message}
          onRetry={handleFirmwareUpdate}
        />
      ) : null}
      {status === AsyncLifecycle.FULFILLED ? (
        <SuccessView onPress={handleNext} />
      ) : null}
    </>
  );
}
