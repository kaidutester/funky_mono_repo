import React from 'react';
//import {View} from 'react-native';
import { styled } from '@kaidu/shared/lib/styles';

const BaseView = styled.View`
  background-color: ${props => props.theme.colors.primary};
`;

export default function MyView(props) {
  return (
    <BaseView {...props} />
  );
}
