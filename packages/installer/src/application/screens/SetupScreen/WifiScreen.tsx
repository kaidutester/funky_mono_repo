import React from 'react';
import { View } from '@kaidu/shared/components/atomic';
import { tailwind } from '@kaidu/shared/lib/styles';
import { useNavigation } from '@react-navigation/native';
import { useUsersList } from '@kaidu/shared/features/kaidu-server/users-list';
import ActivityIndicator from '~/components/atomic/ActivityIndicator';
import { ErrorModal } from '@kaidu/shared/domain/error-handling/components';
import { WifiFormController } from './WifiFormController';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { BasicTemplate } from '@kaidu/shared/components/template/BasicTemplate';

export default function WifiScreen(props) {
  // A screen for editing Wifi in Setup
  console.debug(`WifiScreen screen mounted`);

  //Hooks
  const { route } = props;
  const { defaultValues } = route?.params;
  const { data: user, isLoading, isError } = useUsersList();
  const navigation = useNavigation();

  const ssid = defaultValues[0] ?? '';
  const password = defaultValues[1] ?? '';

  if (isLoading) {
    return <ActivityIndicator text={'Loading customer data...'} />;
  }

  if (isError) {
    <ErrorModal
      errorMsg={'Failed to fetch customer id'}
      onCancel={() => navigation.pop()}
    />;
  }

  return (
    <BasicTemplate>
      <KeyboardAwareScrollView style={[tailwind('w-full')]}>
        <View style={tailwind('p-3 w-full flex-auto')}>
          <WifiFormController
            loggedInCustomerId={user?.customers_list_id}
            defaultSSID={ssid}
            defaultPassword={password}
            navigation={navigation}
          />
        </View>
      </KeyboardAwareScrollView>
    </BasicTemplate>
  );
}
