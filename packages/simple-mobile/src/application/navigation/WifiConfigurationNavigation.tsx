import { Text } from '@kaidu/shared/components/atomic';
import { Button } from '@kaidu/shared/components/atomic/Button';
import { View } from '@kaidu/shared/components/atomic/View';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import {} from '../screens/Configuration';
import { useTheme } from '@kaidu/shared/lib/styles';

function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 30 }}>This is the home screen!</Text>
      <Button
        onPress={() => navigation.navigate('MyModal')}
        title="Open Modal"
      />
    </View>
  );
}

function DetailsScreen() {
  return (
    <View>
      <Text>Details</Text>
    </View>
  );
}

function ModalScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 30 }}>This is a modal!</Text>
      <Button onPress={() => navigation.goBack()} title="Dismiss" />
    </View>
  );
}

const WifiConfigurationStack = createStackNavigator();

export function RootStackScreen() {
  const theme = useTheme();
  // const hideScreenTitleOptions = {
  //   headerShown: false,
  //   headerTransparent: true,
  //   headerBackground: () => <View />,
  //   headerTitle: '',
  //   headerTintColor: theme?.colors?.tertiary,
  // };

  return (
    <WifiConfigurationStack.Navigator>
      <WifiConfigurationStack.Group>
        <Stack.Screen
          name={STACK_SCREENS.CONFIG}
          component={Configuration}
          // options={hideScreenTitleOptions}
        />
        {/* <RootStack.Screen name="Details" component={DetailsScreen} /> */}
      </WifiConfigurationStack.Group>
      <WifiConfigurationStack.Group screenOptions={{ presentation: 'modal' }}>
        <WifiConfigurationStack.Screen name="MyModal" component={ModalScreen} />
        <WifiConfigurationStack.Screen name="MyModal" component={ModalScreen} />
      </WifiConfigurationStack.Group>
    </WifiConfigurationStack.Navigator>
  );
}