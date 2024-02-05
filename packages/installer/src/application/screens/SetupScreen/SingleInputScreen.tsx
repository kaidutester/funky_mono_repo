import React, { useLayoutEffect, useMemo } from 'react';
// import PageTemplate from '~/components/template/PageTemplate';
import { View } from '@kaidu/shared/components/atomic';
import { tailwind } from '@kaidu/shared/lib/styles';
import ControlledInput from '@kaidu/shared/components/molecule/ControlledInput';
import { useForm } from 'react-hook-form';
import { STACK_SCREENS } from "~/navigation/routes";
import { EditHeaderBtn } from './HeaderBtn';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BasicTemplate } from '@kaidu/shared/components/template/BasicTemplate';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// import { FormInput } from '@kaidu/shared/components/atomic/FormInput';

// const defaultValue = 'test'
// const name = 'test';
// const label = 'test';

/**
 * A screen for editing a single field
 */
export default function SingleInputScreen() {

  const navigation = useNavigation();
  const { params } = useRoute();

  const { defaultValue, name, label } = params as any || {};
  console.debug(`SingleInputScreen mounted`);
  const defaultValues = {};
  defaultValues[name] = defaultValue;

  const { control, getValues } = useForm({ defaultValues: defaultValues });

  const handleDone = () => {
    //@ts-ignore
    const saved = getValues(name).trim();
    const params = {};
    params[name] = saved;
    // console.debug(getValues(name));
    //@ts-ignore
    navigation.navigate({
      name: STACK_SCREENS.SETUP.MAIN,
      params: params,
      merge: true,
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <EditHeaderBtn onPress={handleDone} />,
    });
  }, [navigation]);

  return (
    <BasicTemplate>
      {/* <KeyboardAwareScrollView keyboardDismissMode="none"> */}
      <View style={tailwind('p-3')}>
        <ControlledInput
          control={control}
          name={name}
          defaultValue={defaultValue}
          multiline={false}
          label={label}
        />
        {/* <FormInput /> */}
      </View>
      {/* </KeyboardAwareScrollView> */}
    </BasicTemplate>
  );
}
