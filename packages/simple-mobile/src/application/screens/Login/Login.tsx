import { LoginScreen } from '@kaidu/shared/application/LoginScreen';
import { DISPLAY_NAME, VERSION } from '@kaidu/simple/src/lib';
import { STACK_SCREENS } from '@kaidu/simple/src/domain/navigation/routes';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
// import { getEmailFromResponseData } from '@kaidu/shared/features/authentication';
import { ReactNativeErrorBoundary } from '@kaidu/shared/domain/error-handling';
// import useError from 'react-use/lib/useError';
import { checkHasMultiAvailableCustomer } from '@kaidu/shared/domain/user';
import { getTargetRouteAfterLogin } from './processors';



/**
 * Login root screen in simple app
 * with error boundary
 */
export function LoginWithErrorBoundary() {
  return (
    <ReactNativeErrorBoundary>
      <LoginContainer />
    </ReactNativeErrorBoundary>
  );
}

/**
 *
 */
export function LoginContainer() {
  //Hooks
  const navigation = useNavigation();

  /**
   * Login was successful, Go to the next screen
   */
  const handleLoginSuccess = ({ userItem }) => {
    console.log("Login was successful, Go to the next screen")
    const isMulti = checkHasMultiAvailableCustomer(userItem);
    const targetRoute = getTargetRouteAfterLogin(userItem);
    // @ts-ignore
    isMulti && navigation.navigate(targetRoute);
  };

  return (
    <LoginScreen
      onSuccess={handleLoginSuccess}
      title={DISPLAY_NAME}
      version={VERSION}
      onBackHome={() => navigation.navigate(STACK_SCREENS.HOME)}
    />
  );
}
