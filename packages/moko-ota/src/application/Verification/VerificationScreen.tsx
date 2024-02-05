import React, { useCallback, useEffect } from 'react';
import { View, Text } from '@kaidu/shared/components';
import { useFocusEffect } from '@react-navigation/native';
// import useAsyncFn from 'react-use/lib/useAsyncFn';
import { tailwind } from '@kaidu/shared/lib/styles';
import { useNavigation } from '@react-navigation/native';
import { STACK_SCREENS } from '../../navigation/routes';
import { Button } from '@kaidu/shared/components/atomic/Button';
import { useMachine } from '@xstate/react';
import { mokoUpdateStateMachine } from '../../domains/moko';
import { updateFirmwareFilePath } from '../../domains/moko/providers/mokoSlice';
import { useDispatch } from 'react-redux';

const TEST_FIRMWARE_VERSION = 'v0.4.1.bin';

/**
 * 1. Verify firmware file is ready
 *    1.1 verify file name
 *    1.2 checkFile
 * 2. Verify MQTT server is connectable
 */
export function VerificationScreen() {
  // Hooks
  const navigation = useNavigation();
  const [mokoUpdateState, send] = useMachine(mokoUpdateStateMachine);
  const { context, value } = mokoUpdateState || {};
  const { verification } = value || ({} as any);
  const dispatch = useDispatch();
  // console.log("VerificationScreen ~ context:", context);
  // console.log(
  //   ' VerificationScreen ~ verification state:',
  //   verification
  // );

  // Local states

  /**
   * start verification whenever go to this screen
   */
  useFocusEffect(
    useCallback(() => {
      let isCancelled = false;
      if (!isCancelled) {
        !verification && send('START_VERFICATION');
      }

      //cleanup states
      return () => {
        isCancelled = true;
      };
    }, [])
  );

  useEffect(() => {
    let isCancelled = false;

    if (verification === 'success') {
      navigation.navigate(STACK_SCREENS.MOKO.WIFI);
    }
    if (context?.firmwareFileName) {
      console.log(
        'update firmwareFileName in global state:',
        context?.firmwareFileName
      );
      dispatch(
        updateFirmwareFilePath(
          `/kaidu-firmware-storage/${context.firmwareFileName}`
        )
      );
    }

    //cleanup states
    return () => {
      isCancelled = true;
    };
  }, [verification, context?.firmwareFileName]);

  const handleManualUpdateFirmwareVersion = () => {
    dispatch(
      updateFirmwareFilePath(
        `/kaidu-firmware-storage/${TEST_FIRMWARE_VERSION}`
      )
    );
    navigation.navigate(STACK_SCREENS.MOKO.WIFI);
  };

  const isError = verification === 'error';
  const displayedMsg =
    verification === 'verifyFile' ? `Verifying firmware file` : context?.msg;

  return (
    <View style={tailwind('p-8')}>
      {isError ? (
        <Text style={tailwind('text-red-500')}>{context?.errorMsg}</Text>
      ) : (
        <Text>{displayedMsg}</Text>
      )}
      {isError ? (
        <View > 
          <Text>{`Continue with firmware version ${TEST_FIRMWARE_VERSION}?`}</Text>
          <Button onPress={handleManualUpdateFirmwareVersion} title={'Continue'} />
          <Button onPress={() => send('START_VERFICATION')} title={'Retry'} style={tailwind('mt-4')} />
          <Button onPress={() => navigation.goBack()} title={'Cancel'} style={tailwind('mt-4')} />
        </View>
      ) : null}
    </View>
  );
}
