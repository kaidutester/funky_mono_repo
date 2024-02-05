import React from 'react';
import { KaiduScannedItem } from '@kaidu/shared/application/ScannerItem';
import { ScannedItemList } from '@kaidu/shared/components/organism/ScannedItemList';
import { useNavigation } from '@react-navigation/native';
import { STACK_SCREENS } from '@kaidu/simple/src/domain/navigation/routes';

/**
 * Scanned Device List in the simplified app
 */
export function SimpleScannedList(props) {
  const { selectedCustomerID, ...rest } = props;
  // Hooks
  const navigation = useNavigation();

  function renderScannedItem({ item: { id, category } }) {
    const handleNavigate = data => {

      navigation.navigate(STACK_SCREENS.WIFI.PARENT, {
        screen: STACK_SCREENS.CONFIG,
        params: {bleId: id},
      });
    };

    return (
      <KaiduScannedItem
        key={id}
        bleID={id}
        onNavigate={handleNavigate}
        selectedCustomerID={selectedCustomerID}
        accessibilityLabel={'Kaidu Scanner Item'}
        testID={'Kaidu Scanner Item'}
      />
    );
  }

  return (
    <ScannedItemList renderItem={renderScannedItem} />
  );
}
