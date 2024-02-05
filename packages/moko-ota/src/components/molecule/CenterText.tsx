import React from 'react';
import { styled } from '@kaidu/shared/lib/styles';
import Text from '../atomic/Text';
import View from '../atomic/View';
import {scale, verticalScale} from 'react-native-size-matters';

const CenterView = styled(View)`
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  flex: 1;
  height: 100%;
`;

export default function CenterText({text, ...optionals}) {
  const {children, ...rest} = optionals;
  return (
    <CenterView {...rest}>
      {text ? <Text style={{fontSize: scale(14)}}>{text}</Text> : null}
      {children}
     </CenterView>
  );
}
