import { useNavigation, useRoute } from '@react-navigation/native';
import _ from 'lodash';
import React, { useLayoutEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { Divider } from 'react-native-elements';
import { tailwind } from '@kaidu/shared/lib/styles';
import Label from '~/components/atomic/Label';
import ListItem from '~/components/atomic/ListItem';
import ScrollView from '~/components/atomic/ScrollView';
import { FormInput } from '@kaidu/shared/components/atomic/FormInput';
import { BasicTemplate } from '@kaidu/shared/components/template/BasicTemplate';
import { STACK_SCREENS } from "~/navigation/routes";
import { EditHeaderBtn } from './HeaderBtn';
import { updateObject } from '~/lib/data-operations';
import { isFilledArray } from '@kaidu/shared/utils';

function ScreenContainer(props) {
  return (
    <BasicTemplate>
      <ScrollView style={tailwind('p-3')}>{props.children}</ScrollView>
    </BasicTemplate>
  );
}

function SetupSelector() {
  //Hooks
  const navigation = useNavigation();
  const { params } = useRoute();
  const {
    defaultValue,
    options,
    name,
    label,
    hasCreate = true,
    resetNames,
  }: { options: string[], name: string, label: string, hasCreate: boolean, resetNames: string[], [x: string]: any } = params as any || {};

  //State
  const [currentValue, setCurrentValue] = useState(defaultValue);

  const handleDone = () => {
    console.debug(`currentValue: ${currentValue}`);
    if (currentValue !== defaultValue) {
      // const updated = _.set({}, name, currentValue.trim());
      const updated = updateObject({}, name, currentValue, resetNames);

      navigation.navigate({
        name: STACK_SCREENS.SETUP.MAIN,
        params: updated,
        merge: true,
      });
    } else {
      navigation.goBack();
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <EditHeaderBtn onPress={handleDone} />,
    });
  }, [currentValue]);

  return (
    <>
      {label ? <Label>{label}</Label> : null}
      {isFilledArray(options) ? (
        <>
          {options?.map((option, index) => (
            <Pressable
              onPress={() => setCurrentValue(option)}
              key={`${index}-${option}`}>
              <ListItem title={option} isSelected={option === currentValue} />
            </Pressable>
          ))}
        </>
      ) : null}
      {hasCreate ? (
        <>
          <Divider style={{ marginVertical: 10 }} />
          <FormInput
            name={name}
            value={currentValue}
            onChangeText={setCurrentValue}
            multiline={false}
            label={`Create new ${label}`}
          />
        </>
      ) : null}
    </>
  );
}

export default function SelectAndCreateScreen(props) {
  // A screen for editing a field in Setup screen

  return (
    <ScreenContainer>
      <SetupSelector />
    </ScreenContainer>
  );
}
