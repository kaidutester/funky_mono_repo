import React from 'react';
import { Pressable } from '@kaidu/shared/components/atomic/Pressable';
import { Text } from '@kaidu/shared/components/atomic/Text';

/**
 * A pressable for cancel
 * @returns 
 */
export function CancelHeader(props) {
  const {onPress, ...optionals} = props;
  return (
    <Pressable
      {...props}
      onPress={() => {
        // Do something
      }}>
      <Text>Cancel</Text>
    </Pressable>
  );
}
