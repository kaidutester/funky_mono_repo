import React, { useEffect } from 'react';
import { View, Text } from '@kaidu/shared/components/atomic';
import { ReactNativeErrorBoundary } from '@kaidu/shared/domain/error-handling';
import { useTheme } from '@kaidu/shared/lib/styles';
import { BasicListItem } from '@kaidu/shared/components/molecule/ListItem';
import { Alert, Linking } from 'react-native';
import { VersionText } from '@kaidu/shared/components/organism/VersionText';
import { VERSION } from '../../../lib';
import { tailwind } from '@kaidu/shared/lib/styles';
import { STACK_SCREENS, } from '@kaidu/simple/src/domain/navigation';
import { useCustomer } from '@kaidu/shared/features/local-storage';
import {
  useAuthFromLocalStorage,
  useLogout,
} from '@kaidu/shared/features/authentication';
import { UserInfoView2 } from '@kaidu/shared/components/organism/UserInfoView';
import { Icon } from '@kaidu/shared/components/atomic/Icon';
// import { useSWRConfig } from 'swr';
import { OverlayActivityIndicator } from '@kaidu/shared/components/atomic/ActivityIndicator';
import { checkHasMultiAvailableCustomer } from '@kaidu/shared/domain/user';
import { useUsersList } from '@kaidu/shared/features/kaidu-server';
import { DocShieldIcon } from './DocShieldIcon';
// import useUnmountPromise from 'react-use/lib/useUnmountPromise';

const ICON_SIZE = 38;

const handlePrivacyPolicy = () => {
  Linking.openURL('https://www.kaidu.ai/privacypolicy');
};

const handleFeedback = () => {
  Linking.openURL('https://www.kaidu.ai/contact');
};

/**
 * Main content in the drawer side bar
 */
export function DrawerItemGroup({ navigation, ...optionals }) {

  const { isAuthValid, data: loginInfo } = useAuthFromLocalStorage();
  const { selectedCustomer, isLoading, isError } = useCustomer();
  const { data: UserConfigurationData } = useUsersList(isAuthValid);
  const { state: logoutState, execute: executeLogout } = useLogout();
  const theme = useTheme();
  // console.log("file: DrawerItemGroup.tsx:21 ~ DrawerItemGroup ~ selectedCustomer:", selectedCustomer)
  const { email, photo, name } = loginInfo?.user || {};
  // console.log("file: DrawerItemGroup.tsx:26 ~ DrawerItemGroup ~ loginInfo?.user:", loginInfo?.user)

  const handleLogout = () => {
    executeLogout();
  };

  useEffect(() => {
    if (logoutState.error) {
      Alert.alert('Logout failed', logoutState.error.message);
    }
    if (logoutState.value) {
      navigation.closeDrawer();
    }
  }, [logoutState]);

  if (logoutState.loading) {
    return (
      <OverlayActivityIndicator
        text={'Logout'}
        isVisible={logoutState.loading}
      />
    );
  }

  const hasMultiAvailableCustomers = checkHasMultiAvailableCustomer(
    UserConfigurationData,
  );

  return (
    <ReactNativeErrorBoundary>
      <View style={[tailwind('bg-transparent flex-1 py-8 px-4')]}>
        <View style={[tailwind('bg-transparent flex-1')]}>
          <UserInfoView2
            email={email}
            photo={photo}
            name={name}
            style={tailwind('mb-4')}
          />
          {/* XXXDC removed <BasicListItem
            title={'Selected Site'}
            onPress={() => navigation.navigate(STACK_SCREENS.CUSTOMER)}
            subtitle={isLoading ? 'Loading' : selectedCustomer?.customer_name}
            subTitleStyle={{
              color: hasMultiAvailableCustomers
                ? theme.colors?.secondary
                : theme.colors?.grayscale[3],
            }}
            containerStyle={tailwind('px-0')}
            leftComponent={
              <Icon
                name={'list-alt'}
                type="font-awesome5"
                size={ICON_SIZE}
                color={
                  hasMultiAvailableCustomers
                    ? theme.colors?.secondary
                    : theme.colors?.grayscale[3]
                }
              />
            }
            disabled={!hasMultiAvailableCustomers}
          /> */}
          <BasicListItem
            title={'Privacy Policy'}
            onPress={handlePrivacyPolicy}
            containerStyle={tailwind('px-0')}
            leftComponent={<DocShieldIcon size={ICON_SIZE} />}
          />
          <BasicListItem
            title={'Send feedback'}
            onPress={handleFeedback}
            containerStyle={tailwind('px-0')}
            leftComponent={
              <Icon name={'comment'} type="font-awesome" size={ICON_SIZE} />
            }
          />
          {/* XXXDC removed <BasicListItem
            title={'Logout'}
            onPress={handleLogout}
            containerStyle={tailwind('px-0')}
            leftComponent={<Icon name="logout" size={ICON_SIZE} />}
          /> */}
        </View>
        <VersionText text={VERSION} />
      </View>
    </ReactNativeErrorBoundary>
  );
}