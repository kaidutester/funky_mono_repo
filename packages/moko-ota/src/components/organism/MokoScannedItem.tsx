import React from 'react';
import View from '../atomic/View';
import { ScannedItemUI } from '@kaidu/shared/domain/kaidu-scanner-ble/components/ScannedItemUI';
import { useSelector, useDispatch } from 'react-redux';
// import { selectScannedDevice } from '@kaidu/shared/providers/ble-devices';
import { selectScannedDevice } from '@kaidu/shared/providers/ble-devices';
import { useNavigation } from '@react-navigation/native';
import { STACK_SCREENS } from "~/navigation/routes";
import { updateTargetDevice } from '../../domains/moko/providers/mokoSlice';

/**
 * Scanned Item of Moko devices
 */
export function MokoScannedItem({ mac, ...rest }) {
  // Hooks
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Global state
  const deviceInState = useSelector(state => selectScannedDevice(state, mac));
  // console.log("file: MokoScannedItem.tsx:15 ~ MokoScannedItem ~ deviceInState", mac, deviceInState);


  const handlePress = () => {
    dispatch(updateTargetDevice(deviceInState));
    navigation.navigate(STACK_SCREENS.MOKO.VERIFY);
  };

  return (
    <View {...rest}>
      <ScannedItemUI
        macAddress={mac}
        rssi={deviceInState?.rssi}
        data={deviceInState}
        onPress={handlePress}
      />
    </View>
  );
}
