import React from 'react';
import { Button } from '@kaidu/shared/components/atomic/Button';
import { View } from '@kaidu/shared/components/atomic/View';
import { ProgressTimer } from '@kaidu/shared/components/molecule/ProgressTimer';
import { tailwind } from '@kaidu/shared/lib/styles';

/**
 * Progress timer and a cancel button
 */
export function ProgressGrouped({ shouldShow, onCancel, ...optionals }) {
  const { ...rest } = optionals;

  return (
    <View style={[tailwind('mt-16 mb-10 w-full justify-between flex-grow items-center'), { display: shouldShow ? 'flex' : 'none' }]}>
      <ProgressTimer shouldReset={shouldShow} />
      {/* XXXDC removed <Button title='Cancel' onPress={onCancel} type={'outline'} /> */}
    </View>
  )
}
