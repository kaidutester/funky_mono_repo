import React from 'react'
import { View } from '@kaidu/shared/components/atomic/View';
import { Button } from '@kaidu/shared/components/atomic/Button';
import { Heading } from '@kaidu/shared/components/atomic/Heading';
import { useNavigation } from '@react-navigation/native';
import { HappyFaceIcon } from '@kaidu/shared/components/molecule/HappyFaceIcon';
import { useTheme, scale, tailwind } from '@kaidu/shared/lib/styles';
import { Text } from '@kaidu/shared/components/atomic/Text';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import { cancelConnection } from '@kaidu/shared/features/ble-general';

/**
 * 
 */
export function SuccessMsg({ bleId, ...optionals }) {
  const { showButtons = { close: true }, onClose, ...rest } = optionals;
  const { close } = showButtons || {};

  // Hooks
  const navigation = useNavigation();
  const theme = useTheme();

  useEffectOnce(() => {
    console.log("SuccessMsg: mounted");
    try {
      cancelConnection(bleId);
    } catch (error) {
      console.debug(`SuccessMsg cannot disconnect device ${bleId}`);
    }
  });

  return (
    <View style={[tailwind('justify-around w-full pt-16 px-8 flex-grow')]}>
      <HappyFaceIcon size={scale(96)} />
      <View>
        <Heading style={[tailwind('mt-2 mb-3'), { color: theme?.colors?.tertiary }]}>Connected!</Heading>
        <Text style={[{ color: theme?.colors?.tertiary, textAlign: 'center' }, tailwind('leading-6')]}>Scanner connected to the Internet.</Text>
      </View>
      <View style={tailwind('mt-8 w-full items-center')}>
        {close ? <Button title='Close' onPress={onClose} type={'primary'} /> : null}
      </View>
    </View>
  )
}
