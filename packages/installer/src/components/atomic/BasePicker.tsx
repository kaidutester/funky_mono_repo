import React from 'react';
import { Picker } from '@react-native-picker/picker';
import { styled } from '@kaidu/shared/lib/styles';
import { withTheme } from '@kaidu/shared/lib/styles';
import Label from './Label';

const StyledPicker = styled(Picker).attrs(props => ({
  style: {
    width: '100%',
    ...props.style,
  },
}))`
  flex: 1;
  max-height: 100%;
  height: 100%;
`;

function BasePicker({ options = [], style, ...optionals }) {
  const { label, ...rest } = optionals;

  return (
    <>
      {label && <Label>{label}</Label>}
      <StyledPicker dropdownIconColor="grey" {...rest}>
        {options
          ? options.map((item, index) => (
            <Picker.Item
              label={item}
              value={item}
              key={`${item}-${index}`}
              color={rest.theme.colors.tertiary}
              style={{ fontSize: 18 }}
            />
          ))
          : null}
      </StyledPicker>
    </>
  );
}

export default withTheme(BasePicker);
