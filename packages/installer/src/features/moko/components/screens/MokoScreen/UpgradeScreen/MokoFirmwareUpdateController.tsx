import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useState } from 'react';
import BackgroundTimer from 'react-native-background-timer';
import { useDispatch, useSelector } from 'react-redux';
import Text from '~/components/atomic/Text';
import { BleManager } from '~/lib/ble-general';
import { MokoProcessor } from '~/lib/moko-device';
import { AndroidMokoModule } from '~/lib/NativeModules';
import { setUpdating } from '~/lib/redux/globalStatusSlice';
import { selectMokoGlobalConfig } from '~/features/moko/providers/mokoSlice';
import { sleep } from '@kaidu/shared/utils'
import { LongTextContainer } from '../../../organism/MokoScreenFrame';
import { unwrapResult } from '@reduxjs/toolkit';
import { disconnectConnectedDeviceThunk } from '@kaidu/shared/providers/ble-devices';
import { checkUpdateResultOfDevice } from '@kaidu/shared/features/ble-kaidu';
import { checkIsKaiduName } from '@kaidu/shared/features/ble';
import { MOKO_FIRMWARE_URL, KAIDU_FIRMWARE_URL } from '~/features/firmware';
// import { scanBLEWithoutLimitTime } from '@kaidu/shared/features/ble-general';
import { getAPPClientIDForMQTT } from '~/features/firmware';

const MokoModule = AndroidMokoModule;
const timeoutErrorText = 'Timeout! The update process has run 6 mins. Please check the device and try again.';

function getMokoToKaiduFirmwareConfig(type: string = 'Moko'): { HOST: string, PORT: string, SUBPATH: string } {
  if (type === 'Moko') {
    return MOKO_FIRMWARE_URL;
  } else { // Kaidu
    return KAIDU_FIRMWARE_URL;
  }
}

/**
 * 
 */
export function MokoFirmwareUpdateController({
  onSuccess,
  onError,
  device,
  ...optionals
}) {

  const dispatch = useDispatch();

  const { name, id: mac, localName } = device || {};
  const deviceName = name || localName;

  // Local states
  const [displayedMsg, setDisplayedMsg] = useState('Preparing firmware update');

  const {
    mqttServerHost,
    mqttServerPort,
  } = useSelector(selectMokoGlobalConfig);

  const appClientId = getAPPClientIDForMQTT();

  const [deviceId, devPublish, devSubscribe] = MokoProcessor.createMQTTConfig(
    deviceName,
    mac,
  );

  /**
   * Moko to Moko: LED -> blinking green -> finish -> blinking blue -> solid blue
   * dependencies: name, mac, mqttServerHost, mqttServerPort, firmwareHost, firmwarePort,firmwarefilepath, appClientId
   */
  const executeUpdate = async timeoutId => {
    const { HOST: firmwareHost, PORT: firmwarePort, SUBPATH: firmwarefilepath } = getMokoToKaiduFirmwareConfig('Kaidu') || {};

    console.debug(`execute Update device ID: ${deviceId}`);
    console.debug(
      `Target Firmware: host - ${firmwareHost}, port - ${firmwarePort}, filepath - ${firmwarefilepath}`,
    );

    await sleep(9 * 1000);
    // return;
    //send request to update firmware
    if (MokoModule) {
      console.debug(`send request to update firmware`);
      // throw new Error('Test moko update');
      await MokoModule.updateFirmware(
        mqttServerHost,
        mqttServerPort,
        firmwareHost,
        firmwarePort,
        firmwarefilepath,
        deviceId,
        appClientId,
        devSubscribe,
        devPublish,
      );
      console.debug('MokoModule.updateFirmware is called');
    }
    //TODO: send request in iOS

    // on each scanned device, check if can find a Kaidu Scanner with the same mac
    // determine the update result based on the readings from that device
    const onDevice = device => {
      const { id, name, localName } = device;
      // console.debug('Update scanned Device id: ' + id);
      const isKaidu =
        checkIsKaiduName(localName) ||
        checkIsKaiduName(name);

      if (id === mac && isKaidu) {
        // if scanned device has the same MAC address and device is Kaidu now
        console.debug('Found this Device with Name: ' + localName);
        BleManager.stopScanning();

        // If we can get the new Kaidu Scanner and confirm it is running
        checkUpdateResultOfDevice(mac)
          .then(isUpdateDone => {
            deactivateKeepAwake();
            BackgroundTimer.clearTimeout(timeoutId);
            isUpdateDone ? onSuccess() : onError();
          })
          .catch(err => {
            console.error(
              `Error in checkUpdateResultByStatistic: ${err?.message}`,
            );
            onError();
          })
          .finally(async () => {
            deactivateKeepAwake();
            BackgroundTimer.clearTimeout(timeoutId);

            const resultAction = await dispatch(disconnectConnectedDeviceThunk(mac));
            const originalPromiseResult = unwrapResult(resultAction);

            dispatch(setUpdating(false));
          });
      }
    };

    await sleep(30 * 1000);

    // scan for devices until found the same device
    BleManager.scanBLEWithoutLimitTime(onDevice, err => {
      console.error(err);
    });
  };

  useEffect(() => {
    activateKeepAwake();
    const timeoutId = BackgroundTimer.runBackgroundTimer(() => {
      console.error(timeoutErrorText);
      onError(new Error(timeoutErrorText));
    }, 60000 * 6);

    executeUpdate(timeoutId).catch(err => {
      deactivateKeepAwake();
      BackgroundTimer.clearTimeout(timeoutId);
      console.error(err?.message);
      onError(err);
    });
    setDisplayedMsg(
      'Light should turn to blinking green in a few seconds. Please wait around 1 to 5 mins until you see the light changes to solid green, off and stays at blinking blue in the end',
    );
  }, []);

  return (
    <LongTextContainer>
      <Text>{displayedMsg}</Text>
    </LongTextContainer>
  );
}
