import { View } from '@kaidu/shared/components/atomic/View';
import { AsyncLifecycle } from '@kaidu/shared/types';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { tailwind } from '@kaidu/shared/lib/styles';
import { ProgressGrouped } from './ProgressGrouped';
import { SuccessMsg, ErrorMsg, Retriever, Verifier, Writer } from './Steps';
import { Wifi } from '@kaidu/shared/features/wifi';
import { addListenerToBleStopScanEvent, cancelConnection, isDeviceConnected } from '@kaidu/shared/features/ble-general';
//import useEffectOnce from 'react-use/lib/useEffectOnce';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateIsScanning, updateIsConfigured } from '@kaidu/shared/lib/redux/globalStatusSlice';
import { cleanUpScannedDevices } from '@kaidu/shared/providers/ble-devices';
import { STACK_SCREENS } from '@kaidu/simple/src/domain/navigation/routes';
//import { sleep } from '@kaidu/shared/utils';
import { PlugState } from '@kaidu/shared/features/ble-kaidu';
import { selectSetup, updateSetup } from '@kaidu/shared/lib/redux/setupSlice';
import { ScannerState } from './Steps/Verifier/types';

/**
 * for existing and new devices
 */
function getWritingInputs(macAddress, data, wifi_ssid, wifi_password) {
  if (data) {
    return { ...data, mac_address: macAddress, wifi_ssid, wifi_password };
  } else {
    return { mac_address: macAddress, wifi_ssid, wifi_password };
  }
}

/**
 * 
 */
export function SetupStepsContainer({
  bleId,
  macAddress,
  customerId,
  device_name,
  ...optionals
}) {
  const { wifi_ssid, wifi_password, ...rest } = optionals;
  const { state, plugState } = useSelector(selectSetup);

  // Hooks
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Local states
  const [status, setStatus] = useState('idle'); //XXXDC was ''
  const [errorMsg, setError] = useState('Error'); //XXXDC was useState<Error | null>(null);
  const [data, setData] = useState(null);

  // Props
  const wifiInput: Wifi = { ssid: wifi_ssid, password: wifi_password };

  // XXXDC added to control progress-timer
  let lastPlugState = '';
  const [scannerState, setScannerState] = useState<ScannerState>('');
  const [progressState, setProgress] = useState<boolean>(true);

  // throw new Error('Setup test');
  const handleError = async (err: Error) => {
    console.debug(`SetupStepsContainer:56 handleError: ${err?.message}`);

    // disconnect for failure. change the message if cannot disconnect
    const isConnected = await isDeviceConnected(bleId);
    if (isConnected) {
      const isDisconnected = await cancelConnection(bleId);
      if (!isDisconnected) {
        console.debug('Failed to disconnect BLE device');
        const nextErrMsg = ' Failed to disconnect BLE device. Please close the app and retry';
        err.message = nextErrMsg;
      }
    }
    //XXXDC replaced with going to home
    // setError(err);
    // setStatus('rejected');
    // return;
    const plugState = lastPlugState; //XXXDC was 'rejected';
    const doneSetupState = {
      name: device_name,
      state: AsyncLifecycle.REJECTED,
      bleId,
      plugState,
    };
    dispatch(updateSetup(doneSetupState));
    dispatch(cleanUpScannedDevices()); //XXXDC added
    setProgress(false); //XXXDC added to stop progress-timer
    setData(null);
    if (err) {
      setError(err.message);
    }
    setStatus('rejected');
    // Alert.alert(
    //   `Timeout Alert.`,
    //   `Please check the scanner to determine if it connected successfully.`,
    //   [{ text: 'OK', onPress: () => navigation.navigate(STACK_SCREENS.HOME) }],
    // );
    //XXXDC end of replacement
  };

  //XXXDC add handler to update scanner status and close component
  const handleUpdate = async (result) => {
    const { plugState } = result || {};
    console.log("SetupStepsContainer.tsx handleUpdate plugState:", plugState);
    lastPlugState = plugState;
    setScannerState(plugState);
  };

  const handleClose = async () => {
    // navigate to Home screen
    // used to be called in SetupResultChecker/SetupResult but those components are not used anymore
    console.log('SetupStepsContainer: handleClose: navigating home');
    navigation.navigate(STACK_SCREENS.HOME);
  };
  //XXXDC end of added

  const handleCancel = async () => {
    console.debug('SetupStepsContainer: Cancel btn is pressed');

    //XXXDC added plugstate
    const plugState = '';
    const doneSetupState = {
      name: device_name,
      state: AsyncLifecycle.CANCELLED,
      bleId,
      plugState,
    };
    dispatch(updateSetup(doneSetupState));
    dispatch(updateIsConfigured(true));
    dispatch(cleanUpScannedDevices());
    setProgress(false);
    //XXXDC end of added

    setData(null);
    setError('Cancelled by user');
    await cancelConnection(bleId);

    //setStatus('cancelled'); //XXXDC removed as there is no such state
    Alert.alert(
      `Writing configuration cancelled.`,
      `Please power cycle the scanner and then retry.`,
      //XXXDC changed to go home [{ text: 'OK', onPress: () => navigation.goBack() }],
      [{ text: 'OK', onPress: () => navigation.navigate(STACK_SCREENS.HOME) }],
    );
  };

  const handleConnected = async () => {
    dispatch(updateIsScanning(false)); //XXXDC was addListenerToBleStopScanEvent(() => dispatch(updateIsScanning(false)));

    //const { plugState } = result || {};
    lastPlugState = PlugState.CONNECTED;
    setScannerState(PlugState.CONNECTED);
    const doneSetupState = {
      name: device_name,
      state: AsyncLifecycle.FULFILLED,
      bleId,
      plugState: PlugState.CONNECTED,
    };
    console.log("SetupStepsContainer: handleConnected is called")
    dispatch(updateSetup(doneSetupState));
    dispatch(updateIsConfigured(true)); //XXXDC added to set isConfigured to true
    dispatch(cleanUpScannedDevices());  //XXXDC added
    setProgress(false); //XXXDC added to stop progress-timer

    // XXXDC removed as it is not needed
    // try {
    //   console.log("SetupStepsContainer: handleConnected calling cancelConnection");
    //   await cancelConnection(bleId);      //XXXDC added to disconnect BLE device
    // } catch (error) {
    //   console.debug(`SetupStepsContainer: Error cancelling connection: ${error}`);
    // }
    
    // XXXDC added
    setStatus('connected');
  };

  // XXXDC replaced useEffectOnce with useEffect
  // useEffectOnce(() => {
  //   console.debug('SetupStepsContainer is mounted');
  //   //setStatus('idle'); //XXXDC removed
  // });
  useEffect(
    () => {
      console.log('SetupStepsContainer: mounted, scannerState:', scannerState, 'status:', status);
      console.log('SetupStepsContainer: initial setupState:', device_name, state, bleId, plugState);
      //
      // go to the correct state, if component is remounted
      // by default it will be in 'idle' state, or current state
      //
      if ((scannerState === PlugState.CONNECTED || plugState === PlugState.CONNECTED || state === AsyncLifecycle.FULFILLED) && status !== 'connected') {
        console.log('SetupStepsContainer: useEffect: set to connected');
        setStatus('connected');
        setProgress(false);

      } else if (state === AsyncLifecycle.REJECTED && status !== 'rejected') {
        console.log('SetupStepsContainer: useEffect: set to rejected');
        setStatus('rejected');
        setProgress(false);

      } else if (state === AsyncLifecycle.CANCELLED && status !== 'rejected') {
        console.log('SetupStepsContainer: useEffect: set to cancelled');
        setError('Cancelled by user');
        setStatus('rejected');
        setProgress(false);
      }
      // else if (state === AsyncLifecycle.VERIFYING && status !== 'verify') {
      //   console.log('SetupStepsContainer: useEffect: set to verify');
      //   setStatus('verify');
      //   setProgress(true);

      // } else if (state === AsyncLifecycle.PENDING && status !== 'writing') {
      //   console.log('SetupStepsContainer: useEffect: set to writing');
      //   setStatus('writing');
      //   setProgress(true);
      // }

      return () => {
        console.log('SetupStepsContainer: unmounted');
      };
    },
    // useEffect will run only one time with empty []
    [scannerState, status]
  );
  // XXXDC end replaced code

  return (
    <View
      style={tailwind('flex-grow')}
      accessibilityLabel={'Setup Screen'}
      testID="Setup Screen">
      <View style={tailwind('p-2 pt-6 justify-around items-center flex-grow')}>
        {status === 'idle' ? (
          <Retriever
            macAddress={macAddress}
            customerId={customerId}
            device_name={device_name}
            onFulfilled={data => {
              setData(data);
              setStatus('writing');
              return;
            }}
            onRejected={handleError}
          />
        ) : null}
        {status === 'writing' ? (
          <Writer
            data={getWritingInputs(macAddress, data, wifi_ssid, wifi_password)}
            bleId={bleId}
            customerId={customerId}
            onFulfilled={() => setStatus('verify')} /* XXXDC was onFulfilled={handleConnected} */
            onRejected={handleError}
            shouldStart={status === 'writing'}
          />
        ) : null}
        {status === 'verify' ? (
          <Verifier
            bleId={bleId}
            macAddress={macAddress}
            onUpdated={handleUpdate} /* XXXDC added */
            onFulfilled={handleConnected}
            onRejected={handleError}
            wifi={wifiInput}
          />
        ) : null}
        {status === 'rejected' ? (
          <ErrorMsg
            error={errorMsg}
            onRetry={() => {
              //setError(null);  //XXXDC removed
              setStatus('idle'); //start from beginning
            }}
            bleId={bleId}
            onClose={handleClose} /* XXXDC added */
          />
        ) : null}
        {status === 'connected' ? (
          <SuccessMsg
            bleId={bleId}
            onClose={handleClose}
          />
        ) : null}
        <ProgressGrouped /* shows ProgressTimer */
          shouldShow={progressState /* was status !== 'rejected' */}
          onCancel={handleCancel}
        />
      </View>
    </View>
  );
}