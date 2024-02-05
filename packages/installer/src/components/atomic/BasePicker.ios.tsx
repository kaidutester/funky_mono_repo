import React from 'react';
import { styled } from '@kaidu/shared/lib/styles';
import { withTheme } from '@kaidu/shared/lib/styles';
import Label from './Label';
import RNPickerSelect from 'react-native-picker-select';

const StyledPicker = styled(RNPickerSelect).attrs(props => ({
  textInputProps: {
    style: {
      color: props.theme.colors.tertiary,
      fontSize: 18,
      paddingLeft: 10,
    },
  },
}))`
  flex: 1;
  /* max-height: 100%; */
  height: 40px;
  width: 200px;
`;

function BasePicker({options = [], ...optionals}) {
  const {label, onValueChange, selectedValue, style, ...rest} = optionals;

  return (
    <>
      {label ? <Label>{label}</Label> : null}
      <StyledPicker
        accessibilityLabel={label}
        onValueChange={onValueChange}
        items={options.map((option, index) => {
          return {label: option, value: option, key: `${index + 1}-option`};
        })}
        placeholder={{label: 'Press to select Wi-Fi', value: null}}
        value={selectedValue}
        {...rest}
      />
    </>
  );
}

export default withTheme(BasePicker);
