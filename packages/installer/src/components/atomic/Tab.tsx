import React from 'react';
import { Tab } from 'react-native-elements';
import { View, Text } from 'react-native';
import { styled } from '@kaidu/shared/lib/styles';

const StyledTab = styled(Tab)``;

const StyledTabItem = styled(Tab.Item)``;

export default function BaseTab(props) {
  const {items, ...rest} = props;

  return (
    <StyledTab >
      <Text></Text>
     </StyledTab>
  );
}
