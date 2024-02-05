import { Heading } from '@kaidu/shared/components/atomic/Heading';
import { Text } from '@kaidu/shared/components/atomic/Text';
import { View } from '@kaidu/shared/components/atomic/View';
import { cancelConnection } from '@kaidu/shared/features/ble-general';
import { sleep } from '@kaidu/shared/utils';
import React, { useEffect, useMemo, useState } from 'react';
import usePrevious from 'react-use/lib/usePrevious';
import useUnmountPromise from 'react-use/lib/useUnmountPromise';
import { checkBLEConfiguration, checkServerConfiguration } from './processors';
import { VerifierState, ScannerState } from './types';
import { AsyncLifecycle } from '@kaidu/shared/types';

//XXXDC added imports
import { useDispatch } from 'react-redux';
//import { cleanUpScannedDevices } from '@kaidu/shared/providers/ble-devices/deviceSlice';
import { Icon } from '@kaidu/shared/components/atomic/Icon';
import { useTheme, tailwind } from '@kaidu/shared/lib/styles';
import { updateSetupState, updateSetupPlugState } from '@kaidu/shared/lib/redux/setupSlice';

const WAITING_TIME = 5; // seconds to wait for scanner to reboot
const ICON_SIZE = 16;
const MARGIN_SIZE = 8;

export function Verifier({
  bleId,
  macAddress,
  onUpdated, //XXXDC added
  onFulfilled,
  onRejected,
  ...optionals
}) {
  const { wifi, ...rest } = optionals;
  const theme = useTheme(); //XXXDC added
  const dispatch = useDispatch(); //XXXDC added

  // Local states
  const [status, setStatus] = useState<VerifierState>('');

  // Hooks
  const prevStatus = usePrevious(status);
  const mounted = useUnmountPromise();

  // XXXDC added to control check-icons visibility
  // Add a state variable to control the visibility of the view
  const [scannerState, setScannerState] = useState<ScannerState>('');
  let lastScannerState = ''; // this var changes faster than scannerState
  // const [buttonState, setButtonState] = useState<boolean>(false);
  // XXXDC end of added

  const textInfo = useMemo(() => {
    let result = '';
    switch (status) {
      case 'checkServer':
        result = 'Contacting server.';
        break;
      case 'waiting':
        result = 'Looking for the scanner.';
        break;
      case 'checkBLE':
        if (scannerState === 'f0') {
          result = 'The scanner is booting.';
        } else if (scannerState === 'f1') {
          result = 'The scanner is trying to connect.';
        } else if (scannerState === 'e1') {
          result = 'The scanner failed to connect to WiFi.';
        } else if (scannerState === 'e2') {
          result = 'The scanner failed to connect to the Internet.';
        } else if (scannerState === 'f2') {
          result = 'The scanner is connected.';
          //setButtonState(true);
        } else {
          result = 'Verifying the scanner. This can take up to 1 minute. Please be patient.';
        }
        break;
    }
    return result;
  }, [status, scannerState]);

  //XXXDC add handler to update scanner status
  const handleUpdate = async (result) => {
    const { plugState } = result || {};
    if (lastScannerState == '' && plugState) {
      console.log("Verifier.tsx handleUpdate ", lastScannerState, "->", plugState);
      setScannerState(plugState);
      dispatch(updateSetupPlugState(plugState));
    } else if (lastScannerState && plugState && lastScannerState != plugState) {
      console.log("Verifier.tsx handleUpdate ", lastScannerState, "->", plugState);
      setScannerState(plugState);
      dispatch(updateSetupPlugState(plugState));
    } else {
      console.log("Verifier.tsx handleUpdate scannerState not updated for plugState:", plugState);
    }
    lastScannerState = plugState;
    onUpdated && onUpdated(result);
  };

  let autoCloseTimer;
  const onScanEnd = (result) => {
    // scanning has ended, update scanner state
    const { plugState } = result || {};
    console.log("Verifier.tsx onScanEnd ", lastScannerState, "->", plugState);
    if (plugState) {
      lastScannerState = plugState;
      setScannerState(plugState);
      dispatch(updateSetupPlugState(plugState));
    }
    // if connected, start timer to auto-close
    if (lastScannerState === 'f2') {
      //setButtonState(true);
      autoCloseTimer = setTimeout(() => {
        onFulfilled && onFulfilled();
      }, 2000);
    } else {
      onRejected && onRejected(new Error('Timed-out waiting for scanner to connect.'));
    }
  };
  //XXXDC end of added

  useEffect(() => {
    console.debug(`Verifier is mounted`);
    dispatch(updateSetupState(AsyncLifecycle.VERIFYING)); // update setup state
    //
    if (!status) { // init status
      // disconnect BLE
      cancelConnection(bleId).then((isDisconnected) => {
        !isDisconnected && onRejected(new Error('Cannot disconnect BLE. Please close the app and retry.'));
        isDisconnected && console.debug('Disconnected');
      });
      setStatus('checkServer');
    } else if (status === 'checkServer' && !prevStatus) {
      // check wifi consistency if wifi is given
      if (wifi) {
        mounted(checkServerConfiguration(macAddress, wifi)).then(() => {
          setStatus('waiting');
        }).catch(err => {
          console.error(`file: Verifier.tsx: Error in checkServerConfiguration: ${err?.message}`);
          onRejected(err);
        })
      } else {
        setStatus('waiting');
      }
      setStatus('waiting');
    } else if (status === 'waiting' && prevStatus === 'checkServer') {
      //XXXDC note- this waiting time is for scanner to reboot
      //setStatus('checkBLE'); //XXXDC commented out
      console.log("file: Verifier.tsx: waiting for scanner to reboot")
      mounted(sleep(WAITING_TIME * 1000)).then(() => {
        setStatus('checkBLE');
        lastScannerState = 'f0'; //XXXDC added to set initial state
        setScannerState('f0');   //XXXDC added to set initial state
      }).catch(err => {
        console.error(`file: Verifier.tsx: Error in sleep: ${err?.message}`);
        onRejected(err);
      });
    } else if (status === 'checkBLE' && prevStatus === 'waiting') {
      //XXXDC start BLE scanning to check for scanner
      checkBLEConfiguration(bleId, handleUpdate, onScanEnd, onRejected).then(() => {
        console.log("file: Verifier.tsx: checkBLEConfiguration called, waiting for onScanEnd");
      }).catch(err => {
        console.error(`Error in checkBLEConfiguration`);
        console.error(err);
        onRejected(err);
      })
    }
    return () => {
      console.log('file: Verifier.tsx: useEffect returned');
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [status, prevStatus]);

  return (
        <View>
          <Heading>Verifying</Heading>
          {(scannerState==='') && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: MARGIN_SIZE }}>
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
            </View>
          )}
          {(scannerState==='f0') && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: MARGIN_SIZE }}>
              <Icon name='check-circle' type='font-awesome-5' size={ICON_SIZE} color={theme?.colors?.secondary} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
            </View>
          )}
          {(scannerState==='f1') && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: MARGIN_SIZE }}>
              <Icon name='check-circle' type='font-awesome-5' size={ICON_SIZE} color={theme?.colors?.secondary} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='check-circle' type='font-awesome-5' size={ICON_SIZE} color={theme?.colors?.secondary} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
            </View>
          )}
          {(scannerState==='e1') && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: MARGIN_SIZE }}>
              <Icon name='check-circle' type='font-awesome-5' size={ICON_SIZE} color={theme?.colors?.secondary} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='check-circle' type='font-awesome-5' size={ICON_SIZE} color={theme?.colors?.secondary} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='times-circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
            </View>
          )}
          {(scannerState==='e2') && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: MARGIN_SIZE }}>
              <Icon name='check-circle' type='font-awesome-5' size={ICON_SIZE} color={theme?.colors?.secondary} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='check-circle' type='font-awesome-5' size={ICON_SIZE} color={theme?.colors?.secondary} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='times-circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='times-circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='circle' type='font-awesome-5' size={ICON_SIZE} style={{ marginHorizontal: MARGIN_SIZE }} />
            </View>
          )}
          {(scannerState==='f2') && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: MARGIN_SIZE }}>
              <Icon name='check-circle' type='font-awesome-5' size={ICON_SIZE} color={theme?.colors?.secondary} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='check-circle' type='font-awesome-5' size={ICON_SIZE} color={theme?.colors?.secondary} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='check-circle' type='font-awesome-5' size={ICON_SIZE} color={theme?.colors?.secondary} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='check-circle' type='font-awesome-5' size={ICON_SIZE} color={theme?.colors?.secondary} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='check-circle' type='font-awesome-5' size={ICON_SIZE} color={theme?.colors?.secondary} style={{ marginHorizontal: MARGIN_SIZE }} />
              <Icon name='check-circle' type='font-awesome-5' size={ICON_SIZE} color={theme?.colors?.secondary} style={{ marginHorizontal: MARGIN_SIZE }} />
            </View>
          )}
        {textInfo ? <Text>{textInfo}</Text> : null}
      </View>
  );
}
