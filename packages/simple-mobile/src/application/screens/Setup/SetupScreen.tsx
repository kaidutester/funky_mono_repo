import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';

//import { ScreenWrapper } from '@kaidu/shared/components/headless/ScreenWrapper';
import { SetupStepsContainer } from './SetupStepsContainer';
//import { LTESetupStepsContainer } from "./LTE/LTESetupStepsContainer";
import { useCustomer } from '@kaidu/shared/features/local-storage';
import ActivityIndicator from '@kaidu/shared/components/atomic/ActivityIndicator';
import { ErrorModal } from '@kaidu/shared/domain/error-handling/components';
import { STACK_SCREENS } from '@kaidu/simple/src/domain/navigation/routes';
import { BasicTemplate } from '@kaidu/shared/components/template/BasicTemplate';
import { selectScannedDevice } from '@kaidu/shared/providers/ble-devices';
import { ScannedDeviceInState } from '@kaidu/shared/features/ble-kaidu';
import { ReactNativeErrorBoundary } from '@kaidu/shared/domain/error-handling';
import { resetToHome } from '../../navigation';
//import { SetupResultChecker } from '@kaidu/simple/src/components/organism/SetupResultChecker';
//import { diffInSeconds } from '@kaidu/shared/features/date';
import { AsyncLifecycle } from '@kaidu/shared/types';
import { clearSetup, updateSetup } from '@kaidu/shared/lib/redux/setupSlice';

/**
 * get and process props data for setup process
 * no request to server
 */
function useDeviceData() {
  const route = useRoute();
  const { bleId, wifi_ssid, wifi_password, device_name } =
    (route.params as any) || {};
  const { selectedCustomer, isLoading: isLoadingLocalCustomer, isError: isLocalCustomerError } = useCustomer();

  const device: ScannedDeviceInState = useSelector(state =>
    selectScannedDevice(state, bleId),
  );
  console.debug('setup device', device);
  // console.debug('selectedCustomer: ', selectedCustomer);
  const customerId = selectedCustomer?.customer_id;

  const { mac: macAddress, kaiduDeviceType } = device || {};

  const childProps = kaiduDeviceType === 'lte' ? {
    macAddress,
    bleId,
    customerId,
    device_name,
  } : {
    macAddress,
    bleId,
    customerId,
    device_name,
    wifi_ssid,
    wifi_password,
  };

  return {
    childProps,
    kaiduDeviceType,
    macAddress,
    isLoading: isLoadingLocalCustomer,
    isError: isLocalCustomerError,
    isCustomerIdNotFound: isLocalCustomerError || !customerId
  }
}


/**
 * Screen for Setup configurations for Kaidu scanners
 * validate customerID exist before moving on
 * 
 * used in StackNavigation.tsx via STACK_SCREENS.SETUP
 */
export function Setup() {
  //Hooks
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { isLoading, isCustomerIdNotFound, childProps, kaiduDeviceType, macAddress } = useDeviceData();

  const [isVisible, setIsVisible] = useState(true);

  // XXXDC added timeout code incase we get stuck here
  const timeoutDelay = 600; // BLE scan should be done in 1 minute, set timeout interval to 10 mins
  useEffect(
    () => {
      console.log('Setup: mounted, clear setupState, start setupTimer');
      //
      dispatch(clearSetup()); // clear setup state
      const { bleId, device_name } = childProps;
      const plugSetupState = {
        name: device_name,
        state: AsyncLifecycle.IDLE,
        bleId: bleId,
        plugState: '',
      };
      dispatch(updateSetup(plugSetupState)); // update setup state
      //
      let setupTimer = setTimeout(() => {
        console.log('Setup: timeout & navigate to home');
        setIsVisible(false);
        navigation.navigate(STACK_SCREENS.HOME);
      }, timeoutDelay * 1000); // 10 mins

      // this will clear Timeout
      // when component unmount like in willComponentUnmount
      // and show will not change to true
      return () => {
        console.log('Setup: unmounted, call clearTimeout');
        clearTimeout(setupTimer);
      };
    },
    // useEffect will run only one time with empty []
    // if you pass a value to array,
    // like this - [data]
    // than clearTimeout will run every time
    // this value changes (useEffect re-run)
    []
  );
  // XXXDC end timeout code

  if (isLoading) {
    return <ActivityIndicator text={'Loading...'} />;
  }

  if (isCustomerIdNotFound) {
    return (
      <ErrorModal
        errorMsg={`Customer ID not found. ${isCustomerIdNotFound?.message || ''}`}
        onCancel={() => {
          navigation.navigate(STACK_SCREENS?.LOGIN);
          setIsVisible(false);
        }}
        isVisible={isVisible}
      />
    );
  }

  return (
    <ReactNativeErrorBoundary onReset={() => navigation.dispatch(resetToHome)}>
      {/* XXXDC removed <ScreenWrapper> */}
        <BasicTemplate>
          {/* XXXDC replaced {kaiduDeviceType === 'lte' ? (
            <LTESetupStepsContainer
              {...childProps}
              key={'lte-setup-container' + macAddress}
            />
          ) : (
            <SetupStepsContainer
              {...childProps}
              key={'wifi-scanner-setup-container' + macAddress}
            />
          )} */}
          <SetupStepsContainer
              {...childProps}
              key={'wifi-scanner-setup-container' + macAddress}
            />
          {/* XXXDC removed <SetupResultChecker /> */}
        </BasicTemplate>
      {/* </ScreenWrapper> */}
    </ReactNativeErrorBoundary>
  );
}
