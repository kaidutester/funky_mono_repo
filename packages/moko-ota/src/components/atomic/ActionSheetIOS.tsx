import React, {useState} from 'react';
import {ActionSheetIOS, Button, StyleSheet} from 'react-native';
import View from './View';
import Text from './Text';

export default function MyActionSheet(props) {
  //Props
  const options = [
    'Home1',
    'Home2',
    'Home3',
    'Home4',
    'Home5',
    'Home6',
    'Home7',
    'Home8',
    'Home9',
    'Home10',
    'Home11',
    'Home12',
    'Home13',
    'Home14',
    'Home15',
    'Home16',
    'Home17',
    'Home18',
  ];
  const label = 'Building';
  const defaultValue = options[0];
  const optionsWithControl = [...options, 'Cancel'];
  
  const cancelButtonIndex = optionsWithControl.length - 1;
  
  //State
  const [result, setResult] = useState(defaultValue);

  const onPress = () =>
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: optionsWithControl,
        cancelButtonIndex,
        title: label,
      },
      buttonIndex => {
        if (buttonIndex === cancelButtonIndex) {
          // cancel action
        } else {
          setResult(optionsWithControl[buttonIndex]);
        }
      },
    );

  return (
    <View style={styles.container}>
      <Text style={styles.result}>{result}</Text>
      <Button onPress={onPress} title="Show Action Sheet" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  result: {
    fontSize: 24,
    textAlign: 'center',
  },
});
