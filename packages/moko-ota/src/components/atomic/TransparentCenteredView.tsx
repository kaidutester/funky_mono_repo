import React from 'react';
import View from './View';
import { styled } from '@kaidu/shared/lib/styles';

const StyledView = styled(View)`
  background-color: transparent;
  align-items: center;
  justify-content: center;
`;

export default function TransparentCenteredView(props) {
  return <StyledView {...props} />;
}
