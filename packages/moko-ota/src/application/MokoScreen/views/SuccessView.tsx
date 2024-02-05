import React from 'react';
import { Text } from '@kaidu/shared/components/atomic/Text';
import { MtContainer, StyledBtn } from '../../../domains/moko/components/organism/MokoScreenFrame';

export function SuccessView({ onPress, ...optionals }) {
  return (
    <MtContainer>
      <Text>Success! Firmware OTA is done.</Text>
      <Text>Press "Next" to setup your new Kaidu Scanner</Text>
      <StyledBtn title='Next' onPress={onPress} />
    </MtContainer>
  );
}
