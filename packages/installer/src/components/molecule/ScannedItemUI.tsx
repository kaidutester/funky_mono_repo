import React from 'react';
import { styled } from '@kaidu/shared/lib/styles';
import View from '../atomic/View';
import { Icon } from 'react-native-elements';
import { RowFlex } from '../atomic/Layouts';
// import ListItem from '../atomic/ListItem';
import Text from '~/components/atomic/Text';
import { tailwind } from '@kaidu/shared/lib/styles';
import { selectScannedDevice } from '@kaidu/shared/providers/ble-devices';
import { useSelector } from 'react-redux';
// import { Divider } from '~/components/atomic/Divider';

const DetailContainer = styled(RowFlex)`
  background-color: transparent;
  align-items: center;
  margin-top: 12px;
`;

const DetailItem = styled(View)`
  margin-right: 16px;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  background-color: transparent;
`;

const StyledIcon = styled(Icon).attrs(props => ({
  color: props.theme.colors.tertiary,
}))``;

/**
 * A list item display info of a scanned device
 */
export function ScannedItemUI({ macAddress, ...optionals }) {
  // Props
  const { children, ...rest } = optionals;

  // Global states
  const device = useSelector(state => selectScannedDevice(state, macAddress));
  // console.debug(`ScannedItem device: ${inspect(device)}`);

  if (!device) {
    return null;
  }

  const {
    // name,
    // manufacturerData,
    rssi,
    // mtu,
    // txPowerLevel,
    // serviceUUIDs,
    displayName,
  } = device;

  return (
    <View style={tailwind('h-24 py-2 px-4 bg-transparent')}>
      <Text>{displayName ?? 'New Device'}</Text>
      <Text>{`Mac/UUID: ${macAddress ?? 'Null'}`}</Text>
      <View style={tailwind('flex-row items-center mt-2 bg-transparent')}>
        <StyledIcon name="signal" type="font-awesome-5" size={10} />
        <Text>{`${rssi ?? 'N/A'} dBm`}</Text>
      </View>
      {children ? children : null}
    </View>
  );
}

export default ScannedItemUI;