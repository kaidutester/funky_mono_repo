import { View } from '@kaidu/shared/components/atomic/View';
import { updateSetup } from '@kaidu/shared/lib/redux/setupSlice';
import { AsyncLifecycle } from '@kaidu/shared/types';
import { STACK_SCREENS } from '@kaidu/simple/src/domain/navigation/routes';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { tailwind } from '@kaidu/shared/lib/styles';
import { ProgressGrouped } from '../ProgressGrouped';
import { ErrorMsg, Retriever, Verifier } from '../Steps';
import { cancelConnection, isDeviceConnected } from '@kaidu/shared/features/ble-general';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { selectAPNName, selectOperatorName, clearLTEStates } from '@kaidu/shared/lib/redux/lteSlice';
import { WriterLTE } from '../Steps/Writer/WriterLTE';
import { KaiduDeviceConfiguration } from '@kaidu/shared/features/kaidu-server';
import { EMPTY_KAIDU_DEVICE_CONFIG } from './constants';


/**
 * Setup device configurations for LTE devices
 */
export function LTESetupStepsContainer({
  bleId, macAddress, customerId, device_name, ...optionals
}) {
  // Hooks
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Global states
  const apnName = useSelector(selectAPNName);
  console.debug('APN name', apnName);
  const operator_name = useSelector(selectOperatorName);

  // Local states
  const [status, setStatus] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(EMPTY_KAIDU_DEVICE_CONFIG);

  /**
   * Handles the errors occur during the setup process
   * if it's a PlugStateError, Go to LTE diagnose
   * else go to the general error message
   */
  const handleError = async (err: Error) => {
    console.error(`handleError ${err?.message}`);

    // TODO: add LTE handler for LTE configuration diagnose
    if (err.name === 'PlugStateError') {
      // Alert.alert('Do you want to diagnose the LTE configuration on the device?');
      //@ts-ignore
      navigation.navigate({ name: STACK_SCREENS.LTE_DIAGNOSE, params: { bleId } });
      return;
    }

    // disconnect for failure. change the message if cannot disconnect
    const isConnected = await isDeviceConnected(bleId);
    if (isConnected) {
      const isDisconnected = await cancelConnection(bleId);
      if (!isDisconnected) {
        console.error('Failed to disconnect BLE device');
        const nextErrMsg = ' Failed to disconnect BLE device. Please close the app and retry';
        err.message = nextErrMsg;
      }
    }
    setError(err);
    setStatus('rejected');
    return;
  };

  const handleCancel = async () => {
    console.debug('Cancel btn is pressed');
    await cancelConnection(bleId);

    setData({});
    setError(null);

    dispatch(clearLTEStates());
    setStatus('cancelled');
    Alert.alert(
      'Writing configuration failed',
      `Please power cycle the scanner and then retry.`,
      [{ text: 'OK', onPress: () => navigation.navigate(STACK_SCREENS.HOME)}]
    );
  };

  useEffect(() => {
    if (status === 'done') {
      navigation.navigate(STACK_SCREENS.HOME);
    }
  }, [status]);

  useEffectOnce(() => {
    console.debug('SetupStepsContainer is mounted');
    setStatus('idle');
  });

  const handleVerificationFulfilled = (result) => {
    const { plugState } = result || {};
    const doneSetupState = {
      name: device_name,
      state: AsyncLifecycle.FULFILLED,
      bleId,
      plugState,
    };
    dispatch(updateSetup(doneSetupState));
    dispatch(clearLTEStates());
    setStatus('done');
  };

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
            onFulfilled={(data: KaiduDeviceConfiguration) => {
              setData(data);
              setStatus('writing');
              return;
            }}
            onRejected={handleError} />
        ) : null}
        {status === 'writing' ? (
          <WriterLTE
            data={{ ...data, bleId, customer_id: customerId, apnName, operator_name }}
            onFulfilled={() => setStatus('verify')}
            onRejected={handleError}
            shouldStart={status === 'writing'} />
        ) : null}
        {status === 'verify' ? (
          <Verifier
            bleId={bleId}
            macAddress={macAddress}
            onFulfilled={handleVerificationFulfilled}
            onRejected={handleError} />
        ) : null}
        {status === 'rejected' ? (
          <ErrorMsg
            error={error}
            onRetry={() => {
              setError(null);
              setStatus('idle');
            }}
            bleId={bleId} />
        ) : null}
        <ProgressGrouped
          shouldShow={status !== 'rejected'}
          onCancel={handleCancel} />
      </View>
    </View>
  );
}
