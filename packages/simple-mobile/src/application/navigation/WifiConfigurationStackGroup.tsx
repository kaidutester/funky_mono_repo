import React from 'react';
import { Configuration } from '../screens/Configuration';
import { STACK_SCREENS } from '../../domain/navigation/routes';
import { useTheme } from '@kaidu/shared/lib/styles';
import {
  WifiSelectionModalScreen,
  PasswordModalScreen,
  OtherModalScreen,
} from '../screens/WifiConfiguration';
import { useForm, FormProvider } from 'react-hook-form';
// import { Stack } from './StackNavigation';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from '@kaidu/shared/components/atomic';
import { RefreshWifiListBtn } from '@kaidu/shared/domain/wifi/components';

import { useColorScheme, } from 'react-native';

const Stack = createStackNavigator();

/**
 * Wifi configuration screen and child modal screens
 */
export function WifiConfigurationStackGroup() {
  const theme = useTheme();
  const methods = useForm({
    defaultValues: {
      ssid: '',
      password: '',
      device_name: '',
      temp_wifi_ssid: '',
      temp_wifi_password: '',
    }
  });

  //XXXDC added
  const isDarkMode = useColorScheme() === 'dark';
  //XXXDC end added

  const hideScreenTitleOptions = {
    headerShown: false,
    headerTransparent: true,
    //headerBackground: () => <View />,
    headerTitle: '',
    headerTintColor: theme?.colors?.tertiary,
    //backgroundColor: 'black', //isDarkMode ? theme?.colors?.primary : theme?.colors.white
  };

  return (
    <FormProvider {...methods}>
      <Stack.Navigator initialRouteName={STACK_SCREENS.CONFIG} screenOptions={{
          cardStyle: { backgroundColor: isDarkMode ? theme?.colors?.primary : theme?.colors.white },
          headerStyle: { backgroundColor: isDarkMode ? theme?.colors?.primary : theme?.colors.white },
          headerTitleStyle: { color: theme?.colors?.tertiary },
        }}>
        <Stack.Group>
          <Stack.Screen
            name={STACK_SCREENS.CONFIG}
            component={Configuration}
            options={hideScreenTitleOptions}
          />
        </Stack.Group>
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen
            name={STACK_SCREENS.WIFI.SELECTION}
            component={WifiSelectionModalScreen}
            options={{
              headerTitle: 'Wi-Fi',
              headerRight: ((props) => <RefreshWifiListBtn color={'secondary'} {...props} />),
              //headerLeft: (() => {return null;}), //XXXDC added to remove going back
            }}
          />
          <Stack.Screen
            name={STACK_SCREENS.WIFI.PASSWORD}
            component={PasswordModalScreen}
            options={{
              headerTitle: 'Password',
            }}
          />
          <Stack.Screen
            name={STACK_SCREENS.WIFI.OTHER}
            component={OtherModalScreen}
            options={{
              headerTitle: 'Other',
              headerBackTitle: 'Back'
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </FormProvider>
  );
}
