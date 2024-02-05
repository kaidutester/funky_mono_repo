import React from 'react';
import Input from '../atomic/Input';
import {Controller} from 'react-hook-form';
import { ErrorText } from '@kaidu/shared/domain/error-handling/components/ErrorText';
import { tailwind } from '@kaidu/shared/lib/styles';

function renderSSID() {
  return ({field: {onChange, onBlur, value}}) => (
    <Input
      onBlur={onBlur}
      onChangeText={value => onChange(value)}
      value={value}
      label={'SSID:'}
      spellCheck={false}
      autoCapitalize="none"
      onFocus={() => console.debug('focused')}
    />
  );
}

function renderPassword(showPassword) {
  return ({field: {onChange, onBlur, value}}) => (
    <Input
      onBlur={onBlur}
      onChangeText={value => onChange(value)}
      value={value}
      label={'Password:'}
      secureTextEntry={!showPassword}
      spellCheck={false}
      autoCapitalize="none"
      onFocus={() => console.debug('focused')}
    />
  );
}

export function WifiInputs({control, errors, ...optionals}) {
  const {
    defaultSSID,
    defaultPassword,
    showPassword = false,
    ssidName = 'ssid',
    passwordName = 'password',
    ...rest
  } = optionals;

  return (
    <>
      <Controller
        control={control}
        render={renderSSID()}
        name={ssidName}
        rules={{required: true}}
        defaultValue={defaultSSID}
      />
      {errors?.ssid ? (
        <ErrorText style={tailwind('mb-4')}>The above is required.</ErrorText>
      ) : null}
      <Controller
        control={control}
        render={renderPassword(showPassword)}
        name={passwordName}
        rules={{required: false}}
        defaultValue={defaultPassword}
      />
    </>
  );
}
