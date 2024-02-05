import React from 'react'
import { ErrorContainer } from '../../../organism/MokoScreenFrame';
import { Button } from '@kaidu/shared/components/atomic/Button';
import { ErrorText } from '@kaidu/shared/domain/error-handling/components/ErrorText';
import { tailwind } from '@kaidu/shared/lib/styles';

export function ErrorView({ text, onRetry, ...optionals }) {
  return (
    <ErrorContainer>
      <ErrorText style={tailwind('mb-8')}>{text}</ErrorText>
      <Button title="Retry" onPress={onRetry} />
    </ErrorContainer>
  )
}
