import { Appbar } from '@kaidu/shared/components/molecule/Appbar';
import { useAuthFromLocalStorage } from '@kaidu/shared/features/authentication';
import { ScanGroupFooter } from '@kaidu/shared/domain/kaidu-scanner-ble/components/ScanControllerFooter';
import { PermissionCheck } from '@kaidu/shared/domain/permission/components/PermissionCheck';
import { selectIsInit, selectIsConnecting, updateIsScanning, selectIsConfigured, updateIsConfigured } from '@kaidu/shared/lib/redux/globalStatusSlice';
import { selectConnectingDeviceId, selectHasDevice, cleanUpScannedDevices } from '@kaidu/shared/providers/ble-devices';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SimpleScannedList } from '../../../components/organism/SimpleScannedList';
import { OverlayActivityIndicator } from '@kaidu/shared/components/atomic/ActivityIndicator';
import { BackgroundGroup } from '@kaidu/shared/components/molecule/BackgroundGroup';
import { BasicTemplate } from '@kaidu/shared/components/template/BasicTemplate';
import { useBleScan } from '@kaidu/shared/domain/scanning';
import { ReactNativeErrorBoundary } from '@kaidu/shared/domain/error-handling';
import {
  LOCAL_CUSTOMER_KEY,
  // getAllKeys,
  setCustomer,
  useCustomer,
} from '@kaidu/shared/features/local-storage';
import { useCustomerDataOfDefaultUser } from '@kaidu/shared/features/kaidu-server';
import { permissionStateMachine } from '@kaidu/shared/features/permission/state-machine';
import { useMachine } from '@xstate/react';
import { T, always, cond } from 'ramda';
import { DISPLAY_NAME } from '../../../lib';
// import { handleLocationData } from '../../domain/location';
import { MenuIconBtn } from '@kaidu/shared/components/molecule/MenuBtn';
import { checkHasMultiAvailableCustomer } from '@kaidu/shared/domain/user';
import { useSWRConfig } from 'swr';
import { getBgText, LOADER_TEST_ID, handleDisconnectOnFocus } from '@kaidu/shared/application/screens/ScanningScreen';
import useDebounce from 'react-use/lib/useDebounce';
import { STACK_SCREENS} from '../../../domain/navigation/routes';
import { resetToHome} from '../../../domain/navigation/processors';

/**
 * is scanning - show line progress, scanned list or empty view
 * not scanning - show scanned list or NoScannedDeviceFoundView
 */
export function HomeContent() {
  //Hooks
  const dispatch = useDispatch();
  const [permissionState, sendPermissionEvent] = useMachine(
    permissionStateMachine,
  );
  const isFullyGranted = permissionState.matches('bluetooth.final.granted');
  //console.log("HomeContent permissionState?.context:", permissionState?.context);
  //console.log("HomeContent permissionState?.value:", permissionState?.value);

  const { bleScanState, sendBleScanEvent, startScan, isScanning } = useBleScan();
  //console.log("HomeContent bleScanState?.context:", bleScanState?.context);

  const {
    isAuthValid,
    isLoading: isLoadingAuthLocalData,
    isError: isAuthLocalDataError,
  } = useAuthFromLocalStorage();
  const {
    userData: userItem,
    customer: customerItem,
    isLoading: isLoadingCustomerDataOfDefaultUser,
  } = useCustomerDataOfDefaultUser(isAuthValid);
  const {
    selectedCustomer,
    isLoading: isLoadingCustomerInStorage,
    isError: localSelectedCustomerError,
  } = useCustomer();
  const { customer_id: selectedCustomerID } = selectedCustomer || {};
  const navigation = useNavigation();
  const { mutate } = useSWRConfig();

  //Global states
  const connectingDeviceId = useSelector(selectConnectingDeviceId);
  console.log("HomeContent connectingDeviceId:", connectingDeviceId);
  const isConnectingDevice: boolean = connectingDeviceId?.length > 0; //XXXDC added
  console.log("HomeContent isConnectingDevice:", isConnectingDevice);

  const hasScannedDevice = useSelector(selectHasDevice);
  console.log("HomeContent hasScannedDevice:", hasScannedDevice);

  const isConnecting = useSelector(selectIsConnecting);
  console.log("HomeContent isConnecting:", isConnecting);

  // Local state
  const [uiState, setUiState] = useState('initial'); //XXXDC was 'default'
  const [isBLEScanReady, setIsBLEScanReady] = useState(false);

  //XXXDC added to check if a scanner was configured
  const isConfigured = useSelector(selectIsConfigured);
  console.log("HomeContent isConfigured:", isConfigured);
  //XXXDC end added

  //XXXDC added to check if app was just opened
  const isInit = useSelector(selectIsInit);

  // side effects: disconnect and stop connecting
  // note this is called when screen comes to foreground/focus
  useFocusEffect(
    useCallback(() => {
      let isCancelled = false;

      handleDisconnectOnFocus(isFullyGranted, connectingDeviceId);

      //XXXDC added code to start scanning after writing to device
      // console.log('file: Home.tsx:95 ~ useFocusEffect ~ isConfigured:', isConfigured);
      // if (isConfigured) {
      //   dispatch(cleanUpScannedDevices());
      //   dispatch(updateIsConfigured(false));
      //   startScan();
      // }
      //XXXDC end added

      // cleanup states
      return () => {
        isCancelled = true;
      };
    }, [isConfigured]),
  );

  /**
   * check current selected customer ID, if it's absent, handle it
   */
  useEffect(() => {
    if (
      !selectedCustomerID &&
      !isLoadingCustomerInStorage &&
      isAuthValid &&
      userItem &&
      customerItem
    ) {
      console.debug('No customer selected');
      const isMulti = checkHasMultiAvailableCustomer(userItem);
      if (!isMulti) {
        // no multiple customer options
        setCustomer(customerItem).then(() => {
          mutate(LOCAL_CUSTOMER_KEY, customerItem);
        }); // set the user's customer as the default selected customer
      } else {
        // @ts-ignore
        navigation.navigate(STACK_SCREENS.CUSTOMER);
      }

      //XXXDC added code to start scanning after writing to device
      // console.log('file: Home.tsx:145 ~ useEffect ~ isConfigured:', isConfigured);
      // if (isConfigured) {
      //   dispatch(cleanUpScannedDevices());
      //   dispatch(updateIsConfigured(false));
      //   startScan();
      // }
      //XXXDC end added
    }
  }, [
    selectedCustomer,
    isLoadingCustomerInStorage,
    isAuthValid,
    customerItem,
    userItem,
    isConfigured,
  ]);


  /**
   * Listen to AppState changes
   * recheck permission when the permission is changed and the app was inactive
   * if user denied the request for enabling Bluetooth, do not re-requect
   */
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.debug('Home screen: App has come to the foreground!');
        sendPermissionEvent('RESTART');
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const isPending =
    isLoadingCustomerInStorage ||
    isConnecting ||
    isConnectingDevice || //XXXDC added
    isLoadingAuthLocalData ||
    isLoadingCustomerDataOfDefaultUser;

  // based on the current state, show different background
  const [, cancel] = useDebounce(
    () => {
      const isLocationPassed = Boolean(
        permissionState.matches('bluetooth') ||
        permissionState.context?.isLocationAllowed,
      );
    
      const isBLEDisabled =
        permissionState.matches('bluetooth.final.blocked') ||
        permissionState.matches('bluetooth.final.cancelled');

      const isFullyGranted = permissionState.matches('bluetooth.final.granted');

      const nextUiState = cond([
        [always(isInit && !isBLEDisabled && isLocationPassed), always('initial')],
        [always(isBLEDisabled), always('bleDisabled')],
        [always(!isLocationPassed), always('locationDisallowed')],
        [always(!hasScannedDevice && !isScanning), always('noDevice')],
        //[always(isConnectingDevice), always('connectingDevice')], //XXXDC added
        [T, always('default')],
      ])();

      // update related UI states
      setUiState(nextUiState);
      setIsBLEScanReady(isFullyGranted && (selectedCustomerID !== undefined));

      if (isBLEDisabled) {
        dispatch(updateIsScanning(false));
      }
    },
    1100,
    [permissionState, hasScannedDevice, selectedCustomerID, isInit, isScanning] //XXXDC added isInit and isScanning
  );

  // console.debug('uiState', uiState);
  const bgText = getBgText(uiState);

  return (
    <BasicTemplate accessibilityLabel="Home Screen">
      <Appbar
        title={DISPLAY_NAME}
        leftComponent={
          <MenuIconBtn onPress={() => navigation.openDrawer()} />
        }
        /* XXXDC removed selectedCustomerName={selectedCustomer?.customer_name} */
      />
      {uiState === 'bleDisabled' || uiState === 'locationDisallowed' ? (
        <BackgroundGroup isShown={true} title={bgText} />
      ) : null}
      {uiState === 'noDevice' ? (
        <BackgroundGroup isShown={!isScanning || !hasScannedDevice} title={bgText} />
      ) : null}
      {uiState === 'connectingDevice' ? ( /* XXXDC added */
        <BackgroundGroup isShown={true} title={bgText} />
      ) : null} 
      {uiState === 'initial' ? ( /* XXXDC added */
        <BackgroundGroup isShown={true} title={bgText} />
      ) : null} 
      {uiState === 'default' ? (
        hasScannedDevice ? (
          <SimpleScannedList selectedCustomerID={selectedCustomerID} />
        ) : (
          <BackgroundGroup isShown={true} title={bgText} /*XXXDC added*/ />
        )
      ) : null}
      <PermissionCheck
        shouldStart={isAuthValid}
        appName={DISPLAY_NAME}
        state={permissionState}
        send={sendPermissionEvent}
      />
      <ScanGroupFooter
        isBLEReady={isBLEScanReady}
        send={sendBleScanEvent}
        bleScanState={bleScanState}
        startScan={startScan}
      />
      {isPending ? (
        <OverlayActivityIndicator
          isVisible={isPending}
          text={'Retrieving details for your Kaidu scanner.'} /* XXXDC was {'Loading...'} */
          accessibilityLabel={LOADER_TEST_ID}
          testID={LOADER_TEST_ID}
        />
      ) : null}
    </BasicTemplate>
  );
}

export function Home() {
  const navigation = useNavigation();
  const handleResetError = () => {
    //XXXDC change from Login to Home
    //navigation.dispatch(resetToLogin);
    navigation.dispatch(resetToHome);
    //XXXDC end changes
  };

  return (
    <ReactNativeErrorBoundary onReset={handleResetError}>
      <HomeContent />
    </ReactNativeErrorBoundary>
  );
}
