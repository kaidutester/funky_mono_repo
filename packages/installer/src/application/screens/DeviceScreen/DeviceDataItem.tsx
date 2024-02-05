import React from 'react';
import {TextLine, CheckedText} from './styles/Styleds';
import Text from '../../../components/atomic/Text';
import { tailwind } from '@kaidu/shared/lib/styles';
import ListItem from '~/components/atomic/ListItem';
import { styled } from '@kaidu/shared/lib/styles';

const StyledDeviceDataItem = styled(ListItem).attrs(props => {
  let subtitleColor = props.isConsistent ?? props.theme.colors.tertiary;
  if (typeof props.isConsistent === 'boolean') {
    subtitleColor = props.isConsistent
      ? props.theme.colors.success
      : props.theme.colors.error;
  }

  return {
    titleStyle: {
      color: props.theme.colors.fourth,
      fontSize: 15,
    },
    subtitleStyle: {
      color: subtitleColor,
      fontSize: 21,
    },
  };
})``;

export default function DeviceDataItem({
  value,
  label,
  ...optionals
}) {
  const {isConsistent, children, ...rest} = optionals

  return (
    <StyledDeviceDataItem
      title={label}
      subtitle={value ? value : '-'}
      isConsistent={isConsistent}
      {...rest}
    />
  );
}

export function SimpleDataItem({
  value,
  label,
  children,
  isConsistent,
  ...rest
}) {
  return (
    <TextLine {...rest}>
      <Text>{label}: </Text>
      <CheckedText isConsistent={isConsistent}>
        {value ? value : '-'}
      </CheckedText>
      {children}
    </TextLine>
  );
}
