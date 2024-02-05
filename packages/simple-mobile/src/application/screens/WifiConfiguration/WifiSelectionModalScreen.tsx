import React, { useMemo } from 'react';
import { View } from '@kaidu/shared/components/atomic';
import {
  PASSWORD_NAME,
  SSID_NAME,
  WifiSelectionModal,
} from '@kaidu/shared/domain/wifi';
import { useNavigation, useRoute } from '@react-navigation/native';
import { STACK_SCREENS } from '../../../domain/navigation/routes';
import { useFormContext, useWatch } from 'react-hook-form';
import { selectScannedDevice, selectConnectedDevice } from '@kaidu/shared/providers/ble-devices';
import { useSelector } from 'react-redux';
import { ScannedDeviceInState } from '@kaidu/shared/features/ble-kaidu';
import { ActivityIndicator } from '@kaidu/shared/components/atomic/ActivityIndicator';

/**
 *
 */
export function WifiSelectionModalScreen() {
  const navigation = useNavigation<any>();
  const { control, resetField, setValue, getValues } = useFormContext();
  const route = useRoute<any>();
  const { bleId } = route?.params || {
    bleId: undefined,
  };

  // Global states
  const device: ScannedDeviceInState = useSelector(state =>
    selectScannedDevice(state, bleId),
  );
  const isLoadingWifiList = useSelector(selectConnectedDevice)?.pending?.isLoadingWifiList;
  console.log("file: WifiSelectionModalScreen.tsx:32 ~ WifiSelectionModalScreen ~ isLoadingWifiList:", isLoadingWifiList);

  // console.log("file: WifiSelectionModalScreen.tsx:26 ~ WifiSelectionModalScreen ~ device:", device);
  const { wifiList } = (device as ScannedDeviceInState) || {};
  // console.log("file: WifiSelectionModalScreen.tsx:32 ~ WifiSelectionModalScreen ~ wifiList:", wifiList);

  const currentSsid = useWatch({
    control,
    name: SSID_NAME,
  });

  const processedWifiOptions = useMemo(() => {
    try {
      if (!wifiList) {
        return [];
      }

      return wifiList.map(opt => {
        const { ssid, ...rest } = opt || {};
        const key = `wifi-ssid-${ssid}`;
        const title = ssid;
        const isSelected = currentSsid && currentSsid === ssid;

        return { key, title, isSelected, ssid, ...rest };
      });
    } catch (error) {
      console.debug(`processedWifiOptions error`, error);
    }
    return [];
  }, [wifiList, currentSsid]);
  // console.log("file: WifiSelectionModalScreen.tsx:59 ~ processedWifiOptions ~ processedWifiOptions:", processedWifiOptions);

  /**
   * if a wifi has a known existing password, show it
   * user has set a wifi password, and this function is called
   */
  const handlePressToChangePassword = option => {
    const { ssid, password } = option || {};
    console.log("file: WifiSelectionModalScreen.tsx:70 ~ handlePressToChangePassword ~ option:", option);
    setValue(SSID_NAME, ssid || ''); //XXXDC added & commented out
    setValue(PASSWORD_NAME, password || ''); //XXXDC this is the new password
    //XXXDC update the password in the wifiList
    if (password && wifiList && wifiList.length > 0) {
      for(let i=0; i< wifiList.length; i++) {
        if (wifiList[i].ssid === ssid) {
          wifiList[i].password = password;
          break;
        }
      }
    }
    //XXXDC end of update
    navigation.navigate(STACK_SCREENS.WIFI.PARENT, {
      screen: STACK_SCREENS.WIFI.PASSWORD,
      params: { ssid, bleId },
      merge: true,
    });
  };


  // const handleBack = () => {
  //   console.log('Back to the whole form, reset to init values');
  //   resetField(PASSWORD_NAME);
  //   resetField(SSID_NAME);
  //   navigation.goBack();
  // };

  /**
   * do not show any existing password at the beginning
   */
  const handleOtherWifiNavigation = () => {
    //setValue(PASSWORD_NAME, ''); //XXXDC commented out so that password is not blanked out
    navigation.navigate(STACK_SCREENS.WIFI.PARENT, {
      screen: STACK_SCREENS.WIFI.OTHER,
      params: { ssid: '', bleId },
      merge: true,
    });
  };

  React.useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        // console.log("navigation.addListener ~ e:", e);
        // console.log('Back to the whole form, reset to init values');
        // resetField(PASSWORD_NAME);
        // resetField(SSID_NAME);
        // XXXDC removed the above, so that ssid/password are not reset when navigating back
        console.log('file: WifiSelectionModalScreen.tsx:69 ~ beforeRemove: ', getValues());

        // if (!hasUnsavedChanges) {
        //   // If we don't have unsaved changes, then we don't need to do anything
        //   return;
        // }

        // // Prevent default behavior of leaving the screen
        // e.preventDefault();

        // // Prompt the user before leaving the screen
        // Alert.alert(
        //   'Discard changes?',
        //   'You have unsaved changes. Are you sure to discard them and leave the screen?',
        //   [
        //     { text: "Don't leave", style: 'cancel', onPress: () => {} },
        //     {
        //       text: 'Discard',
        //       style: 'destructive',
        //       // If the user confirmed, then we dispatch the action we blocked earlier
        //       // This will continue the action that had triggered the removal of the screen
        //       onPress: () => navigation.dispatch(e.data.action),
        //     },
        //   ]
        // );
      }),
    [navigation]
  );


  if (isLoadingWifiList) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <WifiSelectionModal
        options={processedWifiOptions}
        onPasswordChangeNavigation={handlePressToChangePassword}
        onOtherWifiNavigation={handleOtherWifiNavigation}
      ></WifiSelectionModal>
    </>
  );
}
