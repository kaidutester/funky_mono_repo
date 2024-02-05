import React from 'react';
import Button from '../atomic/Button';
import { useNavigation } from '@react-navigation/native';
import { STACK_SCREENS } from "~/navigation/routes";

/**
 * Handle navigation to Setup screen for Android and iOS devices
 */
export default function SetupNavigateBtn({
  macAddress,
  uuid,
  bleId,
  onNavigated,
  ...optionals
}: { macAddress: string; uuid: string; bleId: string; onNavigated?: () => any }) {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate({
      name: STACK_SCREENS.SETUP.MAIN,
      params: {
        deviceId: macAddress,
        uuid,
        mac: macAddress,
        bleId,
      },
      merge: true,
    });
  };

  return (
    <Button
      title={`Setup`}
      onPress={handlePress}
      accessibilityLabel={'Setup this Kaidu Scanner'}
      testID={'Setup this Kaidu Scanner'}
      {...optionals}
    />
  );
}
