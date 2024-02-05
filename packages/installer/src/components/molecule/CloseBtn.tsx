import React from 'react';
import { styled } from '@kaidu/shared/lib/styles';
import Button from '../atomic/Button';

export function CloseBtn(props) {

  const StyledBtn = styled(Button)`
    max-width: 50%;
  `;

  return <StyledBtn title="Close" onPress={props.onPress} />;
}
