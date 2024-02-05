import {
  FooterContent,
  HorizontalSpace,
} from '@kaidu/shared/components/atomic/Layouts';
// import Filter from '@kaidu/shared/components/molecule/Filter';
import { useBluetoothState } from '@kaidu/shared/features/ble-general';
import { ScanDeviceBtn } from '@kaidu/shared/features/ble-general/components/ScanDeviceBtn';
import { StopBtn } from '@kaidu/shared/features/ble-general/components/StopBtn';
import { useLocationPermissionCheck } from '@kaidu/shared/domain/permission';
import {
  selectIsScanning,
  selectIsUpdating,
} from '@kaidu/shared/lib/redux/globalStatusSlice';
import {
  disconnectConnectedDeviceThunk,
  selectConnectedDeviceId
} from '@kaidu/shared/providers/ble-devices';
import React from 'react';
import { Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '@kaidu/shared/lib/styles';

const StyledContainer = styled(HorizontalSpace)`
  margin-bottom: 8px;
  max-width: 280px;
`;

const filterProps = {
  onlyKaidu: false,
  onlyMoko: true,
};

/**
 * A controller component for scanning Moko scanners
 * is only enabled when the location & BLE is granted and enabled
 */
export function ScanGroupFooter({
  filterComponents = null,
  ...optionals
}) {
  const { onResetError, ...rest } = optionals;

  // Hooks
  const dispatch = useDispatch();
  const { isPowerOn, isEnabled } = useBluetoothState();
  const { isGranted } = useLocationPermissionCheck(Platform.OS);


  // Global state
  const isScanning = useSelector(selectIsScanning);
  const isUpdating = useSelector(selectIsUpdating);
  const connectedDeviceId = useSelector(selectConnectedDeviceId);

  // hide component when location permission or bluetooth is not granted
  const shouldHide = !isPowerOn || !isGranted;

  const handleStartScan = () => {
    // disconnect connected device
    dispatch(disconnectConnectedDeviceThunk(connectedDeviceId));
  };


  const shouldHideScanBtn = isUpdating || isScanning;

  return (
    <FooterContent {...rest}>
      <StyledContainer>
        {isScanning ? <StopBtn /> : null}
        <ScanDeviceBtn
          onStartScan={handleStartScan}
          disabled={!isPowerOn}
          shouldHide={shouldHideScanBtn}
          kaiduDevicesConfigList={undefined}
          filterProps={filterProps}
        />
      </StyledContainer>
    </FooterContent>
  );
}