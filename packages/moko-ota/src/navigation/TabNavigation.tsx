// Hold for future
import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { STACK_SCREENS } from "~/navigation/routes";

const Tab = createMaterialBottomTabNavigator();


export default function TabNavigation(props) {

  return (
    <Tab.Navigator initialRouteName={STACK_SCREENS.HOME}>
      
    </Tab.Navigator>
  );
}