
import React from 'react';
import { Input } from 'react-native-elements';
import { styled } from '@kaidu/shared/lib/styles';

const StyledInput = styled(Input).attrs((props) => ({
  inputContainerStyle: {
    maxWidth: '100%',
    flexWrap: "wrap",
    ...props.inputContainerStyle
  },
  inputStyle: {
    color: props.theme.colors.tertiary,
    ...props.inputStyle
  },
  containerStyle: {
    paddingHorizontal: 0,
    maxWidth: '100%',
    flexWrap: "wrap",
    ...props.containerStyle
  },
}))``;

export default function BaseInput(props) {
  return (
    <StyledInput {...props} />
  );
}
