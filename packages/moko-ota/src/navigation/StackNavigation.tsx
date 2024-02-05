import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { MokoBLEScreen } from '../application/MokoScreen/BLEScreen';
import { MokoUpgradeScreen } from '../application/MokoScreen/UpgradeScreen';
import { MokoWifiScreen } from '../application/MokoScreen/WifiScreen';
import Home from '../application/screens/Home';
import { VerificationScreen } from '../application/Verification/VerificationScreen';
import { STACK_SCREENS } from './routes';

const Stack = createStackNavigator();
const stackOptions = {
  headerShown: false,
};

export default function StackNavigation() {

  return (
    <Stack.Navigator>
      <>
        <Stack.Screen
          name={STACK_SCREENS.HOME}
          component={Home}
          options={stackOptions}
        />
        <Stack.Group>
          <Stack.Screen
            name={STACK_SCREENS.MOKO.VERIFY}
            component={VerificationScreen}
            options={{ title: 'Verification' }}
          />
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
      </>
      {/* <Stack.Screen
        name={DRAWER_SCREENS.LOGIN}
        component={Login}
        options={stackOptions}
      /> */}
    </Stack.Navigator>
  );
}
