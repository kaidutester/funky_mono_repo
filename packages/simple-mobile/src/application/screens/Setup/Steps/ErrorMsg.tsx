import React from 'react'
import { View } from '@kaidu/shared/components/atomic/View';
import { Button } from '@kaidu/shared/components/atomic/Button';
import { Heading } from '@kaidu/shared/components/atomic/Heading';
import { useNavigation } from '@react-navigation/native';
import { SadFaceIcon } from '@kaidu/shared/components/molecule/SadFaceIcon';
import { useTheme, scale, tailwind } from '@kaidu/shared/lib/styles';
import { darken } from 'polished';
import { Text } from '@kaidu/shared/components/atomic/Text';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import { cancelConnection } from '@kaidu/shared/features/ble-general';

/**
 * 
 */
export function ErrorMsg({ error, onRetry, bleId, ...optionals }) {
  //XXXDC replaced code
  //const { showButtons = { retry: true, back: true }, onConfirm, ...rest } = optionals;
  //const { retry, back } = showButtons || {};
  const { showButtons = { retry: false, back: false, close: true }, onClose, ...rest } = optionals;
  const { retry, back, close } = showButtons || {};
  //XXXDC end replaced code

  // Hooks
  const navigation = useNavigation();
  const theme = useTheme();

  useEffectOnce(() => {
    console.log("ErrorMsg: mounted");
    try {
      cancelConnection(bleId);
    } catch (err) {
      console.debug(`ErrorMsg cannot disconnect device ${bleId}`);
    }
  });

  return (
    <View style={[tailwind('justify-around w-full pt-16 px-8 flex-grow')]}>
      <SadFaceIcon size={scale(96)} />
      <View>
        {/*<Heading style={[tailwind('mt-2 mb-3'), { color: theme?.colors?.tertiary }]}>Error!</Heading>*/}
        {/*<Text style={{ color: darken(0.3, theme?.colors?.error) }}>{error?.message ?? 'No error message found'}</Text>*/}
        <Heading style={[tailwind('mt-2 mb-3'), { color: theme?.colors?.tertiary }]}>{error}</Heading>
        <Text style={[{ color: theme?.colors?.tertiary, textAlign: 'center' }, tailwind('leading-6')]}>Stopped waiting for scanner to connect.</Text>
        <Text style={[{ color: theme?.colors?.tertiary, textAlign: 'center' }, tailwind('leading-6')]}>Please verify the scanner status by checking it's LED.</Text>
      </View>
      <View style={tailwind('mt-8 w-full items-center')}>
        {/* XXXDC removed buttons: {retry ? <Button title='Retry' onPress={onRetry} style={tailwind('mb-4')} /> : null}
        {back ? <Button title='Back' onPress={() => navigation.goBack()} type={'outline'} /> : null} */}
        {close ? <Button title='Close' onPress={onClose} type={'warning'} /> : null /*XXXDC added button*/ }
      </View>
    </View>
  )
}
