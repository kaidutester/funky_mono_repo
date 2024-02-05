import { BasicTemplate } from '@kaidu/shared/components/template/BasicTemplate';
import { PermissionCheck } from '@kaidu/shared/domain/permission/components/PermissionCheck';
import {
  disconnectConnectedDeviceThunk,
  selectConnectedDeviceId,
  selectConnectingDeviceId,
  selectHasDevice,
} from '@kaidu/shared/providers/ble-devices/deviceSlice';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import { scale } from '@kaidu/shared/lib/styles';
import { useDispatch, useSelector } from 'react-redux';
import { withTheme } from '@kaidu/shared/lib/styles';
import { cancelConnection } from '~/lib/ble-general/ble-manager';
import { DISPLAY_NAME, VERSION } from '~/lib/constants';
import {
  selectIsScanning,
} from '~/lib/redux/globalStatusSlice';
import { ScanGroupFooter } from './ScanGroupFooter';
import { LinearProgress } from '@kaidu/shared/components/atomic/LinearProgress';
import Appbar from '../../components/molecule/Appbar';
import CenterText from '../../components/molecule/CenterText';
import { MokoScannedList } from '../../components/organism/MokoScannedList';
import MokoUpdateMessage from '../../components/organism/MokoUpdateMessage';
// import { ResultOverlay } from '../../components/organism/ResultOverlay';
import { permissionStateMachine } from '@kaidu/shared/features/permission/state-machine';
import { useMachine } from '@xstate/react';

export function Home(props) {
  //Hooks
  const dispatch = useDispatch();
  const [permissionState, sendPermissionEvent] = useMachine(
    permissionStateMachine,
  );
  // Global states
  const isScanning = useSelector(selectIsScanning);
  const connectingDeviceId = useSelector(selectConnectingDeviceId);
  const connectedDeviceId = useSelector(selectConnectedDeviceId);
  const hasScannedDevice = useSelector(selectHasDevice);

  // Local state

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
        }

        // stop all existing connecting
        if (connectingDeviceId) {
          const foo = async connectingDeviceId => {
            await cancelConnection(connectingDeviceId);
            if (!isCancelled) {
            }
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
      {/* {isUpdating ? <MokoUpdateMessage /> : null} */}
      {hasScannedDevice ? (
        <MokoScannedList />
      ) : (
        <CenterText
          text={'No Scanner Found or Selected'}
          style={{ paddingHorizontal: scale(10) }}
          accessibilityLabel="Main Text on Home Screen"
        />
      )}
      <PermissionCheck
        shouldStart={true}
        appName={DISPLAY_NAME}
        state={permissionState}
        send={sendPermissionEvent}
      />
      <ScanGroupFooter />
      {/* <ResultOverlay /> */}
    </BasicTemplate>
  );
}

export default withTheme(Home);
