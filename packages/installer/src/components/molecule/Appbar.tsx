import React from 'react';
import { styled } from '@kaidu/shared/lib/styles';
import Text from '../atomic/Text';
import View from '../atomic/View';
import {useNavigation} from '@react-navigation/native';
import Icon from '../atomic/Icon';
import { tailwind } from '@kaidu/shared/lib/styles';

const Container = styled(View)`
  padding: 4px;
  background-color: ${props => props.theme.colors.secondary};
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  margin-bottom: 0;
`;

const Title = styled(Text)`
  color: ${props => props.theme.colors.tertiary};
  font-size: 20px;
  margin: auto;
  text-transform: uppercase;
`;

const Version = styled(Text)`
  color: ${props => props.theme.colors.tertiary};
  align-self: center;
  margin-top: 10px;
  font-size: 11px;
`;

export default function Appbar(props) {
  const {children, title, version} = props;
  const navigation = useNavigation();

  return (
    <Container>
      <Icon name="menu" onPress={() => navigation.toggleDrawer()} size={28}/>
      <View style={tailwind('flex-col bg-transparent')}>
        <Title>{title}</Title>
        <Version>v{version}</Version>
      </View>
      <View style={tailwind('w-6')}></View>
      {children}
    </Container>
  );
}
