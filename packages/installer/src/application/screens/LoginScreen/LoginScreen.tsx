import React from 'react';
import { LoginScreen } from '@kaidu/shared/application/LoginScreen';
import { useNavigation } from '@react-navigation/native';
import { sleep } from '@kaidu/shared/utils';
import { DISPLAY_NAME, VERSION } from '~/lib/constants';
import { STACK_SCREENS } from "~/navigation/routes";
import { getEmailFromResponseData } from '@kaidu/shared/features/authentication';
import { fetchUsersList } from '@kaidu/shared/features/kaidu-server/users-list';
import { updateCustomerId } from '@kaidu/shared/features/local-storage';
import { ReactNativeErrorBoundary } from '@kaidu/shared/domain/error-handling';

export function Login() {
  //Hooks
  const navigation = useNavigation();

  const handleLoginSuccess = async (data) => {
    // check if it is super user
    console.debug('handleLoginSuccess');
    const email = getEmailFromResponseData(data);
    const userItem = await fetchUsersList();
    // const isSuperUser = userItem?.user_email === email && userItem?.isSuperUser;

    await sleep(100);
    await updateCustomerId(userItem?.customers_list_id);
    navigation.navigate(STACK_SCREENS.HOME);
  };

  return (
    <ReactNativeErrorBoundary>
      <LoginScreen
        onSuccess={handleLoginSuccess}
        title={DISPLAY_NAME}
        version={VERSION}
        onBackHome={() => navigation.navigate(STACK_SCREENS.HOME)}
      />
    </ReactNativeErrorBoundary>
  );
}
