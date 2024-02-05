import { ConfigurationSetting } from '@kaidu/shared/application/screens/ConfigurationSetting';
import { ReactNativeErrorBoundary } from '@kaidu/shared/domain/error-handling';
import { ScannedDeviceInState } from '@kaidu/shared/features/ble-kaidu';
import { selectScannedDevice } from '@kaidu/shared/providers/ble-devices';
import { STACK_SCREENS, resetToHome } from '@kaidu/simple/src/domain/navigation';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Configuration screen in simplified app
 */
export function Configuration() {
  // Hooks
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bleId } = route?.params || {
    bleId: undefined,
  };


  // Global states
  const device: ScannedDeviceInState = useSelector(state =>
    selectScannedDevice(state, bleId),
  );
  // console.log("file: Configuration.tsx:25 ~ Configuration ~ device:", device);

  // XXXDC note data is passed in from the wifi form submit
  // handleSetupNavigation -> onNavigation -> WifiConfigurationForm.onSubmit -> WifiConfigurationFormSelectionFirst.handleConfirm
  const handleSetupNavigation = data => {
    console.debug('Navigate to Setup with data', data);
    const { wifi_ssid, wifi_password, device_name } = data || {};
    navigation.navigate({
      name: STACK_SCREENS.SETUP,
      params: { wifi_ssid, wifi_password, bleId, device_name },
    });
  };

  const handleLTEDiagonseNavigate = () => {
    navigation.navigate({ name: STACK_SCREENS.LTE_DIAGNOSE, params: { bleId } });
  };

  const handleLTEOperatorListNavigation = () => {
    navigation.navigate({ name: STACK_SCREENS.OPERATOR_LIST, params: { bleId } });
  };

  const handleWifiChangeNavigation = () => {
    console.debug('handleWifiChangeNavigation is called');
    navigation.navigate(STACK_SCREENS.WIFI.PARENT, { screen: STACK_SCREENS.WIFI.SELECTION, params: { bleId } });
  };

  return (
    <ReactNativeErrorBoundary onReset={() => navigation.dispatch(resetToHome)} /* XXXDC was resetToLogin */> 
      <ConfigurationSetting
        device={device}
        onNavigation={handleSetupNavigation}
        onLTEDiagonose={handleLTEDiagonseNavigate}
        onLTEOperatorListNavigation={handleLTEOperatorListNavigation}
        onWifiChangeNavigation={handleWifiChangeNavigation}
      />
    </ReactNativeErrorBoundary>
  );
}
