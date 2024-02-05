import React from 'react';
import { ScannedItemList } from '@kaidu/shared/components/organism/ScannedItemList';
import { ScannedDeviceCategory } from '../../types/interfaces';
import { MokoScannedItem } from './MokoScannedItem';


export function MokoScannedList() {
  // Hooks

  function renderScannedItem({ item: { id, category } }) {
    // console.debug(`scanned item id: ${id}, category: ${category} should be rendered in InstallerScannedList`);
    if (category === ScannedDeviceCategory.MOKO) {
      return <MokoScannedItem mac={id} key={id} />;
    }
  }

  return (
    <ScannedItemList renderItem={renderScannedItem} />
  )
}
