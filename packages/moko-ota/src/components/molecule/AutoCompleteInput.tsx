import React, { useState } from 'react';
import { useController } from 'react-hook-form';
import View from '../atomic/View';
import Input from '../atomic/Input';
import { styled } from '@kaidu/shared/lib/styles';
import Label from '../atomic/Label';
import ListItem from '../atomic/ListItem';

const DropDownContainer = styled(View)`
  margin-top: -24px;
  border-width: 1px;
  border-radius: 8px;
  border-color: ${props => props.theme.colors.grayscale[4]};
  overflow: hidden;
`;

function MyPicker(props) {
  const { onPress, options } = props;

  if (!options || options.length === 0) {
    return null;
  }

  return (
    <DropDownContainer style={{ elevation: 1 }}>
      {options.map(option => (
        <ListItem
          key={option + '-key'}
          onPress={() => onPress(option)}
          title={option}
        />
      ))}
    </DropDownContainer>
  );
}

export default function AutoCompleteInput({ control, name, label, ...rest }) {
  //A textinput with given suggestions
  const { options = [], defaultValue = '', inputComponent = Input } = rest;

  // console.debug(`Default value of AutoCompleteInput is: ${defaultValue}`);
  const InputComponent = inputComponent;

  const {
    field: { ref, onChange, value },
  } = useController({
    name,
    control,
    rules: { required: true },
    defaultValue,
  });

  const [openDropDown, setOpenDropDown] = useState(false);
  const [queriedOptions, setQueriedOptions] = useState(options);

  const handleChangeText = value => {
    console.debug(`handleChangeText: ${value}`);

    const queried = options.filter(option =>
      option.toLowerCase().includes(value.toLowerCase()),
    );
    setQueriedOptions(queried);

    if (queried.length > 0) {
      setOpenDropDown(true);
    }
    onChange(value);
  };

  const handleChangeSelect = (value: string) => {
    console.debug(`Select ${name}: ${value}`);
    // console.debug(`handleChangeSelect`);
    onChange(value);
    setOpenDropDown(false);
  };

  return (
    <View {...rest}>
      <InputComponent
        onChangeText={handleChangeText}
        label={<Label>{label}:</Label>}
        // onBlur={() => setOpenDropDown(false)}
        onFocus={() => setOpenDropDown(true)}
        value={value}
      />
      {openDropDown ? (
        <MyPicker
          options={queriedOptions}
          onPress={handleChangeSelect}
        />
      ) : null}
    </View>
  );
}
