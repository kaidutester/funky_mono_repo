import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Home } from '../screens/Home/Home';
import { LoginWithErrorBoundary } from '../screens/Login/Login';
import { Setup } from '../screens/Setup';
import { CustomerScreen } from '../screens/CustomerScreen/CustomerScreen';
import { Configuration } from '../screens/Configuration';
import { STACK_SCREENS } from '../../domain/navigation/routes';
import { useAuthFromLocalStorage, useAutoLogout } from '@kaidu/shared/features/authentication';
import ActivityIndicator from '@kaidu/shared/components/atomic/ActivityIndicator';
import { View } from '@kaidu/shared/components/atomic/View';
import { useTheme } from '@kaidu/shared/lib/styles'
import { LTEDiagnoseScreen } from '@kaidu/shared/domain/lte/components/screens/LTEDiagnoseScreen';
import { ManualDiagnose } from '@kaidu/shared/domain/lte/components/screens/ManualDiagnose';
import { OperatorListScreen } from '@kaidu/shared/domain/lte/components/screens/OperatorListScreen';
import { useNavigation } from '@react-navigation/native';
import { resetToHome } from '../../domain/navigation/processors';
import { SettingsScreen } from '../screens/Settings';
import { BASE_STACK_OPTIONS } from './constants';
import { Text } from '@kaidu/shared/components/atomic';
import { Button } from '@kaidu/shared/components/atomic/Button';
import { useFormContext } from "react-hook-form";
import { WifiConfigurationStackGroup } from './WifiConfigurationStackGroup';
import { Image } from 'react-native';

export const Stack = createStackNavigator();



/**
 * auth guard - if not logged in, only display login screen
 */
export function StackNavigation() {
  const { isAuthValid, isLoading, isError } = useAuthFromLocalStorage();
  // console.log("file: StackNavigation.tsx:28 ~ StackNavigation ~ isAuthValid:", isAuthValid);
  const theme = useTheme();
  const navigation = useNavigation();

  useAutoLogout();

  if (isLoading) {
    return <ActivityIndicator text="Loading..." />;
  }

  if (isError) {
    console.error('Error loading auth from local storage', isError);
  }

  /**
   * 
   */
  const handleReset = () => {
    navigation.dispatch(resetToHome);
  };

  return (
    <Stack.Navigator>
      {isAuthValid ? (
        <>
          <Stack.Group>
            <Stack.Screen
              name={STACK_SCREENS.HOME}
              component={Home}
              options={BASE_STACK_OPTIONS}
            />
            <Stack.Screen
              name={STACK_SCREENS.SETUP}
              component={Setup}
              options={BASE_STACK_OPTIONS}
            />
            <Stack.Screen
              name={STACK_SCREENS.CUSTOMER}
              component={CustomerScreen}
              options={BASE_STACK_OPTIONS}
            />
            {/* <Stack.Screen
              name={STACK_SCREENS.CONFIG}
              component={Configuration}
              options={hideScreenTitleOptions}
            /> */}
            <Stack.Screen
              name={STACK_SCREENS.LTE_DIAGNOSE}
              options={BASE_STACK_OPTIONS}>
              {props => <LTEDiagnoseScreen {...props} onReset={handleReset} />}
            </Stack.Screen>
            <Stack.Screen
              name={STACK_SCREENS.MANUAL_DIAGNOSE}
              options={BASE_STACK_OPTIONS}>
              {props => <ManualDiagnose {...props} onReset={handleReset} />}
            </Stack.Screen>
            <Stack.Screen
              name={STACK_SCREENS.OPERATOR_LIST}
              options={BASE_STACK_OPTIONS}>
              {props => <OperatorListScreen {...props} onReset={handleReset} />}
            </Stack.Screen>
            <Stack.Screen
              name={STACK_SCREENS.SETTINGS}
              component={SettingsScreen}
              options={{
                headerTitle: 'Settings',
              }}
            />
            <Stack.Screen
              name={STACK_SCREENS.WIFI.PARENT}
              component={WifiConfigurationStackGroup}
              options={{
                headerShown: false,
              }}
            />
          </Stack.Group>
        </>
      ) : (
        <Stack.Screen
          name={STACK_SCREENS.LOGIN}
          component={LoginWithErrorBoundary}
          options={BASE_STACK_OPTIONS}
        />
      )}
    </Stack.Navigator>
  );
}

export default StackNavigation;