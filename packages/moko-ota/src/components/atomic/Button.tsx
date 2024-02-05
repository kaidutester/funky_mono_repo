import React from 'react';
import { TouchableOpacity } from 'react-native';
import { styled } from '@kaidu/shared/lib/styles';
import Text from './Text';
import { lighten } from 'polished';

const GeneralButton = styled(TouchableOpacity)`
  padding: 8px 8px;
  background: ${props => props.theme.colors.secondary};
  align-items: center;
  justify-content: center;

  /* special styles */
  border: 2px solid ${props => props.theme.colors.fourth};
  border-radius: 8px;
`;

const StyledLabel = styled(Text)`
  color: ${props =>
    props.lighter
      ? lighten(0.6, props.theme.colors.tertiary)
      : props.theme.colors.tertiary};
  /* special styles */
  font-size: 18px;
`;

export default function Button(props) {
  // use TouchableOpacity as base button

  const { title, children, disabled = false, ...rest } = props;

  return (
    <GeneralButton disabled={disabled} {...rest}>
      {title && <StyledLabel lighter={disabled}>{title}</StyledLabel>}
      {children}
    </GeneralButton>
  );
}
