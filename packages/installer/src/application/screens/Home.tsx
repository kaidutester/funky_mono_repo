import React, { useState, useCallback, useEffect } from 'react';
import Appbar from '../../components/molecule/Appbar';
import { cancelConnection } from '~/lib/ble-general/ble-manager';
import { PermissionCheck } from '@kaidu/shared/domain/permission/components/PermissionCheck';
import Snackbar from 'react-native-snackbar';
import { DISPLAY_NAME, VERSION } from '~/lib/constants';
import LinearProgress from '../../components/atomic/LinearProgress';
import { ScanGroupFooter } from '@kaidu/shared/domain/kaidu-scanner-ble/components/ScanControllerFooter';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectIsUpdating,
  selectIsScanning,
} from '~/lib/redux/globalStatusSlice';
import { selectSetupState, updateSetupState } from '@kaidu/shared/lib/redux/setupSlice';
import {
  selectHasDevice,
  selectConnectingDeviceId,
  selectConnectedDeviceId,
  disconnectConnectedDeviceThunk,
} from '@kaidu/shared/providers/ble-devices/deviceSlice';
import { useFocusEffect } from '@react-navigation/native';
import { Alert } from 'react-native';
import MokoUpdateMessage from '../../components/organism/MokoUpdateMessage';
import CenterText from '../../components/molecule/CenterText';
import { withTheme } from '@kaidu/shared/lib/styles';
import { scale } from '@kaidu/shared/lib/styles';
import { InstallerScannedList } from '../../components/organism/InstallerScannedList';
import { BasicTemplate } from '@kaidu/shared/components/template/BasicTemplate';
import { useAuthFromLocalStorage } from '@kaidu/shared/features/authentication';
// import { ResultOverlay } from '../../components/organism/ResultOverlay';
import { permissionStateMachine } from '@kaidu/shared/features/permission/state-machine';
import { useMachine } from '@xstate/react';
import { useBleScan } from '@kaidu/shared/domain/scanning';

export function Home(props) {
  //Hooks
  const dispatch = useDispatch();

  const [permissionState, sendPermissionEvent] = useMachine(
    permissionStateMachine,
  );
  const { bleScanState, sendBleScanEvent, startScan } = useBleScan();

  // Global states
  const isUpdating = useSelector(selectIsUpdating);
  const isScanning = useSelector(selectIsScanning);
  const connectingDeviceId = useSelector(selectConnectingDeviceId);
  const connectedDeviceId = useSelector(selectConnectedDeviceId);
  const hasScannedDevice = useSelector(selectHasDevice);
  const { isAuthValid } = useAuthFromLocalStorage();
  const setupState = useSelector(selectSetupState);

  // Local state
  const [mainText,] = useState('No Scanner Found or Selected');

  useFocusEffect(
    // side effects: disconnect, stop connecting
    useCallback(() => {
      let isCancelled = false;
      try {
        console.debug(`Home screen focused`);
        // when the screen is focused

        // disconnect connected device
        if (connectedDeviceId) {
          console.debug(`disconnecting connected device`);
          dispatch(disconnectConnectedDeviceThunk(connectedDeviceId));
          cancelConnection(connectedDeviceId);
          // MokoModule.disconnectBLE(); // cannot be called before init
        }

        // stop all existing connecting
        if (connectingDeviceId) {
          const foo = async connectingDeviceId => {
            await cancelConnection(connectingDeviceId);
          };

          foo(connectingDeviceId);
        } else {
        }
      } catch (err) {
        console.error(err.message);
        Alert.alert('Cancel connections error', err.message);
      }
      //cleanup states
      return () => {
        isCancelled = true;
      };
    }, []),
  );

  useEffect(() => {
    // show setup message
    console.warn(`Home screen get setup state: ${setupState}`);
    if (setupState) {
      if (setupState === 'fulfilled') {
        setTimeout(() => {
          Snackbar.show({
            text: `Success! Scanner will be disconnected soon. Please wait 10s for the scanner to update data.`,
            duration: Snackbar.LENGTH_LONG,
            numberOfLines: 3,
            backgroundColor: props.theme.colors.success ?? 'darkgray',
          });
        }, 1);

        setTimeout(() => {
          dispatch(updateSetupState('idle'));
        }, 3200);
      }
    }
  }, [setupState]);

  const isFullyGranted = permissionState.matches('bluetooth.final.granted');

  return (
    <BasicTemplate
      accessibilityLabel="Home Screen">
      <Appbar title={DISPLAY_NAME} version={VERSION} />
      {isScanning ? (
        <LinearProgress
          accessibilityLabel="Linear Progress Bar"
          testID="Linear Progress Bar"
        />
      ) : null}
      {isUpdating ? <MokoUpdateMessage /> : null}
      {hasScannedDevice ? (
        <InstallerScannedList />
      ) : (
        <CenterText
          text={mainText}
          style={{ paddingHorizontal: scale(10) }}
          accessibilityLabel="Main Text on Home Screen"
        />
      )}
      <PermissionCheck shouldStart={isAuthValid} state={permissionState}
        send={sendPermissionEvent} />
      <ScanGroupFooter
        isBLEReady={isFullyGranted}
        send={sendBleScanEvent}
        bleScanState={bleScanState}
        startScan={startScan}
      />
      {/* <ResultOverlay /> */}
    </BasicTemplate>
  );
}

export default withTheme(Home);
