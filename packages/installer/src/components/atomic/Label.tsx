import React from 'react';
import Text from './Text';
import { styled } from '@kaidu/shared/lib/styles';

const MyLabel = styled(Text)`
    justify-content: center;
    font-weight: bold;
    color: ${props => props.theme.colors.fourth};
    max-width: 100%;
`;

export default function Label(props) {
  const {children, ...rest} = props;

  return (
    <MyLabel {...rest}>
      {children}
    </MyLabel>
  );
}
