import React from 'react';
import {Text} from 'react-native-elements';
import { styled } from '@kaidu/shared/lib/styles';

export const BASE_SIZE = 14;

const StyledText = styled(Text)`
  color: ${props => props.theme.colors.tertiary};
  font-size: 16px;
`;

export default function MyText(props) {
  return <StyledText {...props} style={props.style} />;
}
