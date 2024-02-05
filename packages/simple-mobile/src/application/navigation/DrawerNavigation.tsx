import {
  DrawerContentScrollView,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import React from 'react';
import { StackNavigation } from './StackNavigation';
import { DRAWER_SCREENS } from '../../domain/navigation/routes';
import { tailwind } from '@kaidu/shared/lib/styles';
import { useTheme } from '@kaidu/shared/lib/styles'
import { lighten } from 'polished';

const Drawer = createDrawerNavigator();

/**
 * 
 */
export function DrawerNavigation({ drawerContent, ...rest }) {
  const theme = useTheme();
  // const isDarkMode = theme?.colors?.name === 'dark';

  return (
    <Drawer.Navigator
      initialRouteName={DRAWER_SCREENS.INIT}
      //useLegacyImplementation={true} // for close the drawer when pressing outside of the drawer //XXXDC removed
      drawerContent={props => {
        return (
          <DrawerContentScrollView
            contentContainerStyle={[
              tailwind('flex-1'),
              {
                justifyContent: 'space-between',
                backgroundColor: lighten(0.1, theme.colors.primary),
              },
            ]}
            {...props}>
            {drawerContent(props)}
          </DrawerContentScrollView>
        );
      }}>
      <Drawer.Screen
        name={DRAWER_SCREENS.INIT}
        component={StackNavigation}
        options={{ headerShown: false, title: 'Home' }}
      />
    </Drawer.Navigator>
  );
}
