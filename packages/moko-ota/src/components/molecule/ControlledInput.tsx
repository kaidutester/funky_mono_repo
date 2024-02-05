import React from 'react';
import {FormInput} from '../organism/ServerConfigForm/style';
import Label from '../atomic/Label';
import {useFormState, Controller} from 'react-hook-form';
import { ErrorText } from '@kaidu/shared/domain/error-handling/components/ErrorText';


const requiredMessage = 'This field is required';

export default function ControlledInput({
  name,
  control,
  multiline=true,
  ...rest
}) {
  const {required = false, defaultValue = '', label} = rest;
  const {errors} = useFormState({control});

  const renderInput = ({field: {onChange, onBlur, value}}) => (
    <FormInput
      onBlur={onBlur}
      onChangeText={value => onChange(value)}
      value={value}
      label={label && <Label>{label}:</Label>}
      multiline={multiline}
      {...rest}
    />
  );

  return (
    <>
      <Controller
        control={control}
        render={renderInput}
        name={name}
        rules={{required}}
        defaultValue={defaultValue}
      />
      {errors[name] ? <ErrorText>{requiredMessage}</ErrorText> : null}
    </>
  );
}
