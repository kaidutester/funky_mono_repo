import React from 'react';
import {View, Text} from 'react-native';
import { styled } from '@kaidu/shared/lib/styles';
import Label from '../atomic/Label';

const MyLabel = styled(Label)`
  
`;

export default function StyledLabel(props) {
  return <Label {...props}></Label>;
}
