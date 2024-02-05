import React, { useLayoutEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { STACK_SCREENS } from "~/navigation/routes";
import { EditHeaderBtn } from './HeaderBtn';
import WifiSettingTabs from '@kaidu/shared/domain/wifi/components/WifiSettingTabs';
import { inspect } from '@kaidu/shared/utils';


export function WifiFormController({
  loggedInCustomerId,
  defaultSSID,
  defaultPassword,
  navigation,
}) {

  const methods = useForm({
    defaultValues: {
      ssid: defaultSSID,
      password: defaultPassword,
      index: 0,
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const handleDone = () => {
    const data = methods.getValues();
    console.debug(`WifiScreen done: ${inspect(data)}`);
    let params;
    if (data.index === 0) {
      params = { wifi_ssid: data?.typedSsid, wifi_password: data?.typedPassword };
    } else {
      params = { wifi_ssid: data?.ssid, wifi_password: data?.password };
    }

    navigation.navigate({
      name: STACK_SCREENS.SETUP.MAIN,
      params,
      merge: true,
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <EditHeaderBtn onPress={handleDone} />
      ),
    });
  }, [navigation]);

  return (
    <>
      <FormProvider {...methods}>
        <WifiSettingTabs
          loggedInCustomer={loggedInCustomerId}
          defaultSSID={defaultSSID}
          defaultPassword={defaultPassword} />
      </FormProvider>
    </>
  );
}
