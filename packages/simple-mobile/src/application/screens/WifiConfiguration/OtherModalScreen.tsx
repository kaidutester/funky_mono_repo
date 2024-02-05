import {
  OtherModal
} from '@kaidu/shared/domain/wifi';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { STACK_SCREENS } from '../../../domain/navigation/routes';
import { useFormContext } from 'react-hook-form';
import { PASSWORD_NAME, SSID_NAME, DEVICE_NAME } from '../../../../../shared/domain/wifi/constants';

/**
 *
 */
export function OtherModalScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bleId } = route?.params || {
    bleId: undefined,
  };
  // console.log("file: PasswordModalScreen.tsx:21 ~ OtherModalScreen ~ bleId:", bleId);
  const { control, setValue, getValues } = useFormContext();

  const handleConfirm = () => {
    // XXXDC change to go directly to Setup
    // navigation.navigate(STACK_SCREENS.WIFI.PARENT, {
    //   screen: STACK_SCREENS.CONFIG,
    //   params: { bleId },
    //   merge: true,
    // });
    const wifi_ssid = getValues(SSID_NAME);
    const wifi_password = getValues(PASSWORD_NAME);
    const device_name = getValues(DEVICE_NAME);
    console.log("file: PasswordModalScreen.tsx:32 ~ OtherModalScreen ~ handleConfirm: ", wifi_ssid, wifi_password, device_name);
    navigation.navigate({
      name: STACK_SCREENS.SETUP,
      params: { wifi_ssid, wifi_password, bleId, device_name },
    });
    // XXXDC end of change
  };

  return (
    <>
      <OtherModal
        onBack={navigation.goBack}
        onConfirm={handleConfirm}
      />
    </>
  );
}
