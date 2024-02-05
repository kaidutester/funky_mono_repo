import React from 'react';
import { useNavigation } from '@react-navigation/native';
import ControlledInput from '@kaidu/shared/components/molecule/ControlledInput';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectMokoGlobalConfig,
  updateFirmwareUrl,
} from '../../features/moko/providers/mokoSlice';
import Button from '../../components/atomic/Button';
import { useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Heading } from '../../components/atomic/Heading';
import WithAppbarTemplate from '../../components/template/WithAppbarTemplate';
import { STACK_SCREENS } from "~/navigation/routes";
import { tailwind } from '@kaidu/shared/lib/styles';

/**
 *  Set firmware url
 */
export function FirmwareUrl(props) {
  const navigation = useNavigation();
  const { control, handleSubmit } = useForm();

  const dispatch = useDispatch();

  const onPress = data => {
    dispatch(updateFirmwareUrl(data));
    navigation.navigate({key: STACK_SCREENS.HOME});
  };

  const { firmwareHost, firmwarePort, firmwarefilepath } = useSelector(
    selectMokoGlobalConfig,
  );

  return (
    <WithAppbarTemplate>
      <KeyboardAwareScrollView style={tailwind('p-6')}>
        <Heading>Firmware Setting</Heading>
        <ControlledInput
          defaultValue={firmwareHost}
          name="firmwareHost"
          label={'Host'}
          control={control}
        />
        <ControlledInput
          defaultValue={firmwarePort}
          name="firmwarePort"
          label={'Port'}
          control={control}
        />
        <ControlledInput
          defaultValue={firmwarefilepath}
          name="firmwarefilepath"
          label={'File Subpath'}
          control={control}
        />
        <Button title="Save" onPress={handleSubmit(onPress)} />
      </KeyboardAwareScrollView>
    </WithAppbarTemplate>
  );
}
