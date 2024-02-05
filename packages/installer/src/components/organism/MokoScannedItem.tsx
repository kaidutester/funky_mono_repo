import React from 'react';
import View from '../atomic/View';
import { ScannedItemUI } from '@kaidu/shared/domain/kaidu-scanner-ble/components/ScannedItemUI';
import { useSelector } from 'react-redux';
// import { selectScannedDevice } from '@kaidu/shared/providers/ble-devices';
import { selectScannedDevice } from '@kaidu/shared/providers/ble-devices';
import { useNavigation } from '@react-navigation/native';
import { STACK_SCREENS } from "~/navigation/routes";

/**
 * Scanned Item of Moko devices
 */
export default function MokoScannedItem({ mac, ...rest }) {
  const navigation = useNavigation();
  const deviceInState = useSelector(state => selectScannedDevice(state, mac));
  console.log("file: MokoScannedItem.tsx:15 ~ MokoScannedItem ~ deviceInState", mac, deviceInState);
  

  const handlePress = () => {
    navigation.navigate(STACK_SCREENS.MOKO.WIFI, { device: deviceInState });
  };

  return (
    <View {...rest}>
      <ScannedItemUI
        macAddress={mac}
        rssi={deviceInState?.rssi}
        displayName={deviceInState?.name || deviceInState?.localName}
        onPress={handlePress}
      />
    </View>
  );
}
