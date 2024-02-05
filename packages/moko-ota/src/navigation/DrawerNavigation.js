import {
  DrawerContentScrollView,
  DrawerItemList,
  createDrawerNavigator
} from '@react-navigation/drawer';
import React from 'react';
import StackNavigation from './StackNavigation';
import { DRAWER_SCREENS } from './routes';

const Drawer = createDrawerNavigator();

export default function DrawerNavigation(props) {
  // Hooks

  return (
    <Drawer.Navigator
      initialRouteName={DRAWER_SCREENS.INIT}
      drawerContent={(props) => {
        return (
          <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
          </DrawerContentScrollView>
        );
      }}
    >
      <Drawer.Screen
        name={DRAWER_SCREENS.INIT}
        component={StackNavigation}
        options={{ headerShown: false, title: 'Home' }}
      />
    </Drawer.Navigator>
  );
}
