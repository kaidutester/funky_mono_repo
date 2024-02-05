import React from 'react';
import { MenuBtn } from '@kaidu/shared/components/molecule/MenuBtn';
import { CUSTOMER_ENTITY_LABEL } from '@kaidu/shared/domain/customer';
import { useUsersList } from '@kaidu/shared/features/kaidu-server';
import ActivityIndicator from '@kaidu/shared/components/atomic/ActivityIndicator';
import { useNavigation } from '@react-navigation/native';
import { STACK_SCREENS } from '../domain/navigation/routes';
import { View } from '@kaidu/shared/components/atomic/View';
import { tailwind } from '@kaidu/shared/lib/styles';
import { useCustomer } from '@kaidu/shared/features/local-storage/customer';
import { checkHasMultiAvailableCustomer } from '@kaidu/shared/domain/user';

/**
 * UI for selecting from available customer list
 * when it's disabled, show nothing
 */
export function SelectCustomerMenu() {
  // Hooks
  const {
    data: user,
    isLoading: isLoadingUsersList,
    isError: isUsersListError,
  } = useUsersList();
  const { selectedCustomer, isLoading, isError } = useCustomer();
  const navigation = useNavigation();

  const isChangeCustomerEnabled = checkHasMultiAvailableCustomer(user);
  if (isUsersListError || !isChangeCustomerEnabled) {
    return <View style={tailwind('w-1')}></View>;
  }

  if (isLoadingUsersList || isLoading) {
    console.debug('userListData:', user);
    return (
      <ActivityIndicator
        text={'Loading users list...'}
        isVisible={isLoadingUsersList}
      />
    );
  }

  const menuItemList = [
    {
      title: `Select ${CUSTOMER_ENTITY_LABEL}`,
      onPress: () => navigation.navigate(STACK_SCREENS.CUSTOMER),
      subtitle: selectedCustomer?.customer_name,
    },
    {
      title: `Settings`,
      onPress: () => navigation.navigate(STACK_SCREENS.SETTINGS),
    }
  ];

  return <MenuBtn list={isChangeCustomerEnabled ? menuItemList : null} />;
}
