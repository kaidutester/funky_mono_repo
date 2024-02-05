import React, { useRef, useState } from 'react';
import Button from '../atomic/Button';
import { BleManager } from '../../lib/ble-general';
import { KaiduOperator } from '../../lib/kaidu-device';
import { inspect } from '@kaidu/shared/utils';
// import { } from '@kaidu/shared/features/ble-kaidu';
// import { connectAndDiscoverDevice } from '@kaidu/shared/features/ble-general';
import { Alert } from 'react-native';
import {
  convertByteArrayToBase64,
  sliceIntoChunks,
  getPercentage,
} from '~/lib/data-operations';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import CircularSlider from '@kaidu/shared/components/atomic/CircularSlider';
import Text from '../atomic/Text';
import { useNavigation } from '@react-navigation/native';
import { getTotalChunks } from '../../lib/data-operations';
import { KAIDU_FIRMWARE_CHUNK_SIZE as CHUNK_SIZE } from '~/features/firmware';
import StyledOverlay from '../atomic/Overlay';
import { CloseBtn } from './CloseBtn';
// import { disconnectConnectedDeviceThunk } from '@kaidu/shared/providers/ble-devices';
import { disconnectConnectedDeviceThunk } from '@kaidu/shared/providers/ble-devices';
import { useDispatch } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { STACK_SCREENS } from "~/navigation/routes";
import { tailwind } from '@kaidu/shared/lib/styles';
import { fetchAsArrayBuffer } from '@kaidu/shared/features/axios';
import { fetchLatestCompatibleFirmwareFileName, fetchFirmWare } from '~/features/firmware';

/**
 * A button handling the Kaidu OTA firmware update
 */
export function BLEOTABtn({ version, deviceId, ...optionals }: { version: any; deviceId: string;[x: string]: any }) {
  const { useCustomizedUrl = false, title = 'OTA', isUpdating, getValues, ...rest } = optionals;

  // Hooks
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // state and refs
  const [progress, setProgress] = useState(0);
  const [textFeedback, setTextFeedback] = useState('');
  const [updateStatus, setUpdateStatus] = useState('idle');
  const writtenChunk = useRef(0);
  const totalChunks = useRef(0);
  const otaListenerErrorCount = useRef(0);
  const cancelled = useRef(false);

  /**
   * fetch firmware file by given url or by latest compatible version
   */
  const handleFetchFirmware = async (
    shouldUseLatest: boolean,
    firmwareUrl?: string,
  ) => {
    let firmware: ArrayBuffer;
    const isUsingCustomizedURL = firmwareUrl && !shouldUseLatest;
    if (isUsingCustomizedURL) {
      setTextFeedback(`Fetching the firmware file`);
      firmware = await fetchAsArrayBuffer(firmwareUrl);
    } else { //fetch latest compatible software version
      const latestVersionFileName = await fetchLatestCompatibleFirmwareFileName(version?.hw);
      if (!latestVersionFileName) {
        throw new Error('No firmware found for this hardware');
      }

      // if (latestVersionFileName === version.sw) {
      //   throw new Error('The lastest firmware has already been installed');
      // }
      // return;
      setTextFeedback(`Fetching the firmware file`);

      firmware = await fetchFirmWare(latestVersionFileName);
    }
    setTextFeedback(`Firmware file is ready`);
    return firmware;
  };

  const handlePress = async () => {
    console.debug(`Current version: ${inspect(version)}`);

    // Validate
    if (useCustomizedUrl && getValues && !getValues('firmwareUrl')) {
      Alert.alert('Please enter a firmware url for updating');
      return;
    }

    try {
      setUpdateStatus('pending');
      console.debug(`OTA starts at ${new Date().toLocaleTimeString()}`);
      setTextFeedback('OTA starts');
      activateKeepAwake();

      //fetch the file
      let firmware;
      if (useCustomizedUrl) {
        const customizedFirmwareUrl = getValues('firmwareUrl');
        console.debug(
          `customized firmware url: ${inspect(customizedFirmwareUrl)}`,
        );
        firmware = await handleFetchFirmware(false, customizedFirmwareUrl);
      } else {
        firmware = await handleFetchFirmware(true);
      }


      //calculate the firmware file
      totalChunks.current = getTotalChunks(firmware, CHUNK_SIZE);

      // set packet size
      const discoveredDevice = await BleManager.connectAndDiscoverDevice(
        deviceId,
      );
      await discoveredDevice.requestMTU(CHUNK_SIZE);

      //start notification, add event listener
      const otaListener = (err, char) => {
        console.debug(`OTA listener is called`);
        if (err) {
          otaListenerErrorCount.current++;
          if (otaListenerErrorCount.current > 1) {
            Alert.alert('OTA Listener error', err.message);
          }
        }
      };

      const subscription = await KaiduOperator.subscribeOtaCharacteristic(
        discoveredDevice,
        otaListener,
      );

      setTextFeedback(`Installing Firmware`);
      //wait 1000 ms
      // await sleep(1000);

      const firmwareBytes = new Uint8Array(firmware);
      const firmwareChunks = sliceIntoChunks(firmwareBytes, CHUNK_SIZE);

      //send buffered data, send all the chunks
      for (let i = 0; i < totalChunks.current; i++) {
        await KaiduOperator.sendSingleFirmwareChunk(
          deviceId,
          convertByteArrayToBase64(firmwareChunks[i]),
        );

        writtenChunk.current++;
        console.debug(`Written Chunks: ${writtenChunk.current}`);
        setProgress(getPercentage(totalChunks.current, i));

        if (cancelled.current) {
          return;
        }
      }

      //unregister and disconnect
      subscription.remove();
      const resultAction = await dispatch(
        disconnectConnectedDeviceThunk(deviceId),
      );
      const originalPromiseResult = unwrapResult(resultAction);

      setUpdateStatus('resolved');
      console.debug('OTA function call finished');
    } catch (err) {
      console.error(err.message);
      setUpdateStatus('rejected');
      Alert.alert('OTA failed', err.message);
    } finally {
      console.debug(`OTA ends at ${new Date().toLocaleTimeString()}`);
      deactivateKeepAwake();

      //Display final result
      const resultMessage = `Firmware update was ${updateStatus}. File was divided into ${totalChunks.current
        } chunks and ${writtenChunk.current
        } chunks was written. Unfinished Chunks: ${totalChunks.current - writtenChunk.current
        }`;
      Alert.alert(
        'Update Result',
        resultMessage,
        [{ text: 'OK', onPress: () => navigation.navigate(STACK_SCREENS.HOME) }],
      );
    }
  };

  return (
    <React.Fragment>
      {isUpdating ? null : (
        <Button {...optionals} title={title} onPress={handlePress} />
      )}
      <StyledOverlay isVisible={updateStatus === 'pending'}>
        <CircularSlider
          size={120}
          width={15}
          fill={progress}
          tintColor="#00e0ff"
          backgroundColor="#3d5875"
        />
        <Text style={tailwind('text-center')}>{textFeedback}</Text>
        <CloseBtn onPress={() => (cancelled.current = true)} />
      </StyledOverlay>
    </React.Fragment>
  );
}



export function BLEOTABtn2({ deviceId, firmwareURL, ...optionals }: { version: any; deviceId: string;[x: string]: any }) {
  const { title = 'OTA', isUpdating, getValues, ...rest } = optionals;

  // Hooks
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // state and refs
  const [progress, setProgress] = useState(0);
  const [textFeedback, setTextFeedback] = useState('');
  const [updateStatus, setUpdateStatus] = useState('idle');
  const firmwareFile = useRef(null);
  const writtenChunk = useRef(0);
  const totalChunks = useRef(0);
  const otaListenerErrorCount = useRef(0);
  const cancelled = useRef(false);

  /**
   * fetch firmware file by given url or by latest compatible version
   */
  const handleFetchFirmware = async () => {
    setTextFeedback(`Fetching the firmware file`);
    const firmware: ArrayBuffer = await fetchAsArrayBuffer(firmwareURL);
    setTextFeedback(`Firmware file is ready`);
    return firmware;
  };

  const handlePress = async () => {

    // Validate
    if (!firmwareURL) {
      Alert.alert('Please enter a firmware url for updating');
      return;
    }

    try {
      setUpdateStatus('pending');
      console.debug(`OTA starts at ${new Date().toLocaleTimeString()}`);
      setTextFeedback('OTA starts');
      activateKeepAwake();

      //fetch the file
      let firmware;
      firmware = await handleFetchFirmware();


      //calculate the firmware file
      totalChunks.current = getTotalChunks(firmware, CHUNK_SIZE);

      // set packet size
      const discoveredDevice = await BleManager.connectAndDiscoverDevice(
        deviceId,
      );
      await discoveredDevice.requestMTU(CHUNK_SIZE);

      //start notification, add event listener
      const otaListener = (err, char) => {
        console.debug(`OTA listener is called`);
        if (err) {
          otaListenerErrorCount.current++;
          if (otaListenerErrorCount.current > 1) {
            Alert.alert('OTA Listener error', err.message);
          }
        }
      };

      const subscription = await KaiduOperator.subscribeOtaCharacteristic(
        discoveredDevice,
        otaListener,
      );

      setTextFeedback(`Installing Firmware`);
      //wait 1000 ms
      // await sleep(1000);

      const firmwareBytes = new Uint8Array(firmware);
      const firmwareChunks = sliceIntoChunks(firmwareBytes, CHUNK_SIZE);

      //send buffered data, send all the chunks
      for (let i = 0; i < totalChunks.current; i++) {
        await KaiduOperator.sendSingleFirmwareChunk(
          deviceId,
          convertByteArrayToBase64(firmwareChunks[i]),
        );

        writtenChunk.current++;
        console.debug(`Written Chunks: ${writtenChunk.current}`);
        setProgress(getPercentage(totalChunks.current, i));

        if (cancelled.current) {
          return;
        }
      }

      //unregister and disconnect
      subscription.remove();
      const resultAction = await dispatch(
        disconnectConnectedDeviceThunk(deviceId),
      );
      const originalPromiseResult = unwrapResult(resultAction);

      setUpdateStatus('resolved');
      console.debug('OTA function call finished');
    } catch (err) {
      console.error(err.message);
      setUpdateStatus('rejected');
      Alert.alert('OTA failed', err.message);
    } finally {
      console.debug(`OTA ends at ${new Date().toLocaleTimeString()}`);
      deactivateKeepAwake();

      //Display final result
      const resultMessage = `Firmware update was ${updateStatus}. File was divided into ${totalChunks.current
        } chunks and ${writtenChunk.current
        } chunks was written. Unfinished Chunks: ${totalChunks.current - writtenChunk.current
        }`;
      Alert.alert(
        'Update Result',
        resultMessage,
        [{ text: 'OK', onPress: () => navigation.navigate(STACK_SCREENS.HOME) }],
      );
    }
  };

  return (
    <React.Fragment>
      {isUpdating ? null : (
        <Button {...optionals} title={title} onPress={handlePress} />
      )}
      <StyledOverlay isVisible={updateStatus === 'pending'}>
        <CircularSlider
          size={120}
          width={15}
          fill={progress}
          tintColor="#00e0ff"
          backgroundColor="#3d5875"
        />
        <Text style={tailwind('text-center')}>{textFeedback}</Text>
        <CloseBtn onPress={() => (cancelled.current = true)} />
      </StyledOverlay>
    </React.Fragment>
  );
}