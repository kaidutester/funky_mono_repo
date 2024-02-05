import React from 'react'
import { Text } from '@kaidu/shared/components/atomic/Text';
import { LongTextContainer, MbContainer } from '../../../domains/moko/components/organism/MokoScreenFrame';
import { ProgressTimer } from '@kaidu/shared/components/molecule/ProgressTimer';
import { Button } from '@kaidu/shared/components/atomic/Button';
import { tailwind } from '@kaidu/shared/lib/styles';

export function PendingView({ onCancel, text, ...optionals }) {
  return (
    <MbContainer>
      <ProgressTimer
        shouldReset={false}
      />
      <LongTextContainer style={tailwind('mt-4')} >
        <Text>{text}</Text>
      </LongTextContainer>
      <Button title="Cancel" onPress={onCancel} style={tailwind('mt-4')} type={'outline'} />
    </MbContainer>
  )
}
