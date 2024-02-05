import React from 'react';
import ActivityIndicator from '../atomic/ActivityIndicator';
import View from '../atomic/View';
import Text from '../atomic/Text';
import { tailwind } from '@kaidu/shared/lib/styles';

export default function BaseUpdateMsg(props) {
  const {text, children} = props;
  return (
    <ActivityIndicator>
      <View style={tailwind('bg-transparent justify-center items-center')}>
        {text ? <Text>{text}</Text> : null}
        {children}
      </View>
    </ActivityIndicator>
  );
}
