import React from 'react';
import { KaiduScannedItem } from '@kaidu/shared/application/ScannerItem';
import {ScannedItemList} from '@kaidu/shared/components/organism/ScannedItemList';
import { useNavigation } from '@react-navigation/native';
import { STACK_SCREENS } from "../../navigation/routes";
import { ScannedDeviceCategory } from '../../types/interfaces';
import MokoScannedItem from './MokoScannedItem';


export function InstallerScannedList() {
  // Hooks
  const navigation = useNavigation();

  function renderScannedItem({ item: { id, category } }) {
    // console.debug(`scanned item id: ${id}, category: ${category} should be rendered in InstallerScannedList`);
    const handleKaiduNavigate = (data) => {
      const { mac, plugState } = data || {};

      //if confirmed, go to the DeviceScreen
      navigation.navigate({
        name: STACK_SCREENS.DEVICE,
        params: {
          macAddress: mac,
          bleId: id,
        },
      });
    };

    if (category === ScannedDeviceCategory.KAIDU) {
      return (
        <KaiduScannedItem key={id} bleID={id} onNavigate={handleKaiduNavigate} />
      );
    }

    if (category === ScannedDeviceCategory.MOKO) {
      return <MokoScannedItem mac={id} key={id} />;
    }
  }

  return (
    <>
      <ScannedItemList renderItem={renderScannedItem} />
    </>
  )
}
