import React from 'react';
import { KeyValuePair } from '@kaidu/shared/components/molecule/KeyValuePair';
import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { tailwind } from '@kaidu/shared/lib/styles';

export function NavigatableItemWithMulti({
  values,
  names,
  screenName,
  label,
  displayedValue,
  ...optionals
}) {
  const { options, children, ...rest } = optionals;
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate({
      name: screenName,
      params: {
        defaultValues: values,
        label,
      },
      merge: true,
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        tailwind('py-2 w-full'),
        pressed ? tailwind('bg-blue-100') : {},
      ]}>
      <KeyValuePair label={label} value={displayedValue ?? `Edit ${label}`} />
    </Pressable>
  );
}
