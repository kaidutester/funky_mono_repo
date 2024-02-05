import React from 'react';
import Button from '../../../components/atomic/Button';
import { tailwind } from '@kaidu/shared/lib/styles';
import { View } from '@kaidu/shared/components/atomic';
import { styled } from '@kaidu/shared/lib/styles';

const Styled = styled(View)`
  background-color: transparent;
`;

export function EditHeaderBtn({onPress, ...optionals}) {
  return (
    <Styled style={tailwind('mr-3')}>
      <Button onPress={onPress} title="Save" {...optionals} />
    </Styled>
  );
}
