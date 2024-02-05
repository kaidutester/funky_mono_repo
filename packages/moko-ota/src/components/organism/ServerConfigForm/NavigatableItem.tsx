import React from 'react';
import KeyValuePair from '../../molecule/KeyValuePair';
import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { tailwind } from '@kaidu/shared/lib/styles';

export function NavigatableItem({
  value,
  name,
  screenName,
  label,
  ...optionals
}: { name: string, screenName: string, label: string, [x: string]: any }) {
  // An item handles press navigation
  const {
    options,
    children,
    onNavigateBackBefore,
    hasCreate, // has the input field to enter new values
    resetNames, // if this value changed, reset values of given names
    ...rest
  }: { options: string[], hasCreate: boolean, resetNames: string[], [x: string]: any } = optionals as any;
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate({
      name: screenName,
      params: {
        defaultValue: value,
        options,
        name,
        label,
        hasCreate,
        resetNames,
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
      ]}
      accessibilityLabel={'Navigation Button for editing data'}
    >
      <KeyValuePair label={label} value={value} invalidValueText={`Edit ${label}`} />
    </Pressable>
  );
}
