import { logout, useAuthFromLocalStorage } from '@kaidu/shared/features/authentication';
import {
  cleanUpScannedDevices,
  selectFilter,
  updateFilter,
} from '@kaidu/shared/providers/ble-devices';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StackNavigation from './StackNavigation';
import { DRAWER_SCREENS } from './routes';

const Drawer = createDrawerNavigator();

export default function DrawerNavigation(props) {
  // Hooks
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Global State
  const { isAuthValid } = useAuthFromLocalStorage();
  const isLoggedIn = isAuthValid;
  const { onlyKaidu: isOnlyKaidu, onlyMoko: isOnlyMoko } =
    useSelector(selectFilter);
    // const isOnlyKaidu = true;
    // const isOnlyMoko = false;

  const handleFactoryUpgrade = () => {
    dispatch(updateFilter({ onlyKaidu: !isOnlyKaidu, onlyMoko: !isOnlyMoko }));
    dispatch(cleanUpScannedDevices());
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const handleLogout = async () => {
    await logout();
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const handleLogin = () => {
    navigation.navigate(DRAWER_SCREENS.LOGIN);
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  return (
    <Drawer.Navigator
      initialRouteName={DRAWER_SCREENS.INIT}
      drawerContent={(props) => {
        return (
          <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
            <DrawerItem
              label={isOnlyMoko ? 'Kaidu Config' : 'Factory upgrade'}
              onPress={handleFactoryUpgrade}
            />
            <DrawerItem
              label={isLoggedIn ? 'Logout' : 'Login'}
              onPress={isLoggedIn ? handleLogout : handleLogin}
            />
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
