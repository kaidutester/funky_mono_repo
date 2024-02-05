import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../application/screens/Home';
import DeviceScreen from '../application/screens/DeviceScreen';
import JSONScreen from '../application/screens/JSONScreen';
import SetupScreen from '../application/screens/SetupScreen';
import KaiduOTAScreen from '../application/screens/KaiduOTAScreen';
import MokoWifiScreen from '../features/moko/components/screens/MokoScreen/WifiScreen';
import MokoBLEScreen from '../features/moko/components/screens/MokoScreen/BLEScreen';
import MokoUpgradeScreen from '../features/moko/components/screens/MokoScreen/UpgradeScreen';
import SingleInputScreen from '../application/screens/SetupScreen/SingleInputScreen';
import SelectAndCreateScreen from '../application/screens/SetupScreen/SelectAndCreate';
import WifiScreen from '../application/screens/SetupScreen/WifiScreen';
import { DRAWER_SCREENS, STACK_SCREENS } from './routes';
import { useAuthFromLocalStorage } from '@kaidu/shared/features/authentication';
import ActivityIndicator from '@kaidu/shared/components/atomic/ActivityIndicator';
import { Login } from '../application/screens/LoginScreen/LoginScreen';

const Stack = createStackNavigator();
const stackOptions = {
  headerShown: false,
};

export default function StackNavigation() {
  // auth guard - if not logged in, only display login screen
  const { isAuthValid, isLoading } = useAuthFromLocalStorage();

  if (isLoading) {
    return <ActivityIndicator text='Loading login status...' />;
  }

  return (
    <Stack.Navigator>
      {isAuthValid ? (
        <>
          <Stack.Screen
            name={STACK_SCREENS.HOME}
            component={Home}
            options={stackOptions}
          />
          <Stack.Screen
            name={STACK_SCREENS.JSON}
            component={JSONScreen}
            options={({ route }) => ({ title: route?.params?.title })}
          />
          <Stack.Screen
            name={STACK_SCREENS.OTA}
            component={KaiduOTAScreen}
            options={{ title: 'Firmware update' }}
          />
          <Stack.Group>
            <Stack.Screen
              name={STACK_SCREENS.MOKO.WIFI}
              component={MokoWifiScreen}
              options={{ title: 'Select Wi-Fi to use' }}
            />
            <Stack.Screen
              name={STACK_SCREENS.MOKO.BLE}
              component={MokoBLEScreen}
              options={{ title: 'Prepare Firmware Upgrade' }}
            />
            <Stack.Screen
              name={STACK_SCREENS.MOKO.UPGRADE}
              component={MokoUpgradeScreen}
              options={{ title: 'Execute Firmware Upgrade' }}
            />
          </Stack.Group>
          <Stack.Screen
            name={STACK_SCREENS.DEVICE}
            component={DeviceScreen}
            options={({ route }) => ({
              title: route?.params?.deviceName ?? 'New Device',
            })}
          />
          <Stack.Group
            screenOptions={({ route }) => ({
              title: `Edit ${route?.params?.label}`,
            })}
          >
            <Stack.Screen
              name={STACK_SCREENS.SETUP.MAIN}
              component={SetupScreen}
              options={{ title: 'Setup Scanner' }}
            />
            <Stack.Screen
              name={STACK_SCREENS.SETUP.SINGLE_INPUT}
              component={SingleInputScreen}
            />
            <Stack.Screen
              name={STACK_SCREENS.SETUP.SELECT_INPUT}
              component={SelectAndCreateScreen}
            />
            <Stack.Screen
              name={STACK_SCREENS.SETUP.WIFI}
              component={WifiScreen}
            />
          </Stack.Group>
        </>
      ) : null}
      <Stack.Screen
        name={DRAWER_SCREENS.LOGIN}
        component={Login}
        options={stackOptions}
      />
    </Stack.Navigator>
  );
}
