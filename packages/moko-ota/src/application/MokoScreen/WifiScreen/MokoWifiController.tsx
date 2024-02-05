import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import Button from '~/components/atomic/Button';
import View from '~/components/atomic/View';
import { Wifi } from '@kaidu/shared/features/wifi';
import { selectWiFiPassword, selectWiFiSSID } from '~/lib/redux/wifiSlice';
import { useUsersList } from '@kaidu/shared/features/kaidu-server/users-list';
import WifiSettingTabs from '@kaidu/shared/domain/wifi/components/WifiSettingTabs';
import ActivityIndicator from '~/components/atomic/ActivityIndicator';
import { ErrorModal } from '@kaidu/shared/domain/error-handling/components';
import { tailwind } from '@kaidu/shared/lib/styles';
import { scale, verticalScale } from '@kaidu/shared/lib/styles';

/**
 * A component for selecting wifi for Moko updates
 */
export function MokoWifiController({ onSuccess, ...optionals }) {
  // Props
  const { onError, ...rest } = optionals;

  //Hooks
  const { data: user, isLoading, isError } = useUsersList();
  const navigation = useNavigation();

  //Global states
  const ssid = useSelector(selectWiFiSSID);
  const password = useSelector(selectWiFiPassword);


  // Hooks depends on other
  const defaultValues = {
    ssid,
    password,
    index: 0,
  };
  const methods = useForm({ defaultValues, reValidateMode: 'onChange' });

  const handleSubmitWifi = data => {

    if (data?.index === 0) {
      const submission: Wifi = { ssid: data.typedSsid, password: data.typedPassword };
      console.debug('submitted wifi', submission);
      onSuccess(submission);
      return;
    }

    const { ssid, password }: Wifi = data;
    onSuccess({ ssid, password });
  };

  if (isLoading) {
    return <ActivityIndicator text={'Loading customer data...'} />;
  }

  if (isError) {
    <ErrorModal
      errorMsg={`Failed to fetch customer id`}
      onCancel={() => navigation.pop()}
    />;
  }

  return (
    <FormProvider {...methods}>
      <View style={[tailwind('justify-start w-full max-w-full'), { flex: 1 }]}>
        <WifiSettingTabs
          loggedInCustomer={user?.customers_list_id}
          defaultSSID={ssid}
          defaultPassword={password}
        />
        <View style={{ marginVertical: verticalScale(20) }}>
          <Button
            title={'Next'}
            onPress={methods.handleSubmit(handleSubmitWifi)}
            disabled={!methods.formState.isValid}
          />
        </View>
      </View>
    </FormProvider>
  );
}
