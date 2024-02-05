import React, { useEffect } from 'react';
import {
  PASSWORD_NAME,
  PasswordModal,
  SSID_NAME,
  DEVICE_NAME,
} from '@kaidu/shared/domain/wifi';
import { useNavigation, useRoute } from '@react-navigation/native';
import { STACK_SCREENS } from '../../../domain/navigation/routes';
import { useFormContext } from 'react-hook-form';
import { Alert } from 'react-native';

/**
 *
 */
export function PasswordModalScreen() {
  const navigation = useNavigation();
  const { control, setValue, getValues } = useFormContext();
  const route = useRoute<any>();
  const { bleId, ssid} = route?.params || {
    bleId: undefined,
  };
  //console.log("file: PasswordModalScreen.tsx:22 ~ bleId:", bleId, "ssid:", ssid);

  const handleConfirm = () => {
    // XXXDC ssid and getValues(PASSWORD_NAME) are the values from the PasswordModal
    console.log('PasswordModalScreen handleConfirm :', ssid, getValues(PASSWORD_NAME), getValues(DEVICE_NAME));
    // setValue(PASSWORD_NAME, getValues(PASSWORD_NAME)); //XXXDC added
    // XXXDC added navigation to go directly to Setup
    // navigation.navigate(STACK_SCREENS.WIFI.PARENT, {
    //   screen: STACK_SCREENS.CONFIG,
    //   params: { bleId },
    //   merge: true,
    // });
    const wifi_password = getValues(PASSWORD_NAME);
    if (wifi_password && wifi_password.trim().length < 64) {
      setValue(SSID_NAME, ssid);
      const wifi_ssid = ssid;
      const device_name = getValues(DEVICE_NAME);
      navigation.navigate({
        name: STACK_SCREENS.SETUP,
        params: { wifi_ssid, wifi_password, bleId, device_name },
      });
    } else {
      Alert.alert(
        `Invalid input.`,
        `Password must be less than 64 characters long.`,
        [{ text: 'Close', onPress: () => console.log('Close PasswordModalScreen alert.') }],
      );
    }
    // XXXDC end of change
  };

  return (
    <>
      <PasswordModal
        onBack={navigation.goBack}
        control={control}
        onConfirm={handleConfirm}
      />
    </>
  );
}
