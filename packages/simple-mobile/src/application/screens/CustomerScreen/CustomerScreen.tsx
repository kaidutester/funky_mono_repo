import React, { useMemo } from 'react';
import { ErrorModal } from '@kaidu/shared/domain/error-handling/components/ErrorModal';
import { H2 } from '@kaidu/shared/components/atomic/Heading';
import {View} from '@kaidu/shared/components/atomic/View';
import { tailwind } from '@kaidu/shared/lib/styles';
import { ScreenWrapper } from '@kaidu/shared/components/headless/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { CustomerSelect } from '@kaidu/shared/components/molecule/CustomerSelect';
import { verticalScale } from '@kaidu/shared/lib/styles';
import { CenteredSpinner } from '@kaidu/shared/components/molecule/CenteredSpinner';
import { ReactNativeErrorBoundary } from '@kaidu/shared/domain/error-handling';
import { useCustomerData } from '@kaidu/shared/domain/customer';
import { useUsersList } from '@kaidu/shared/features/kaidu-server';
import { useAuthFromLocalStorage } from '@kaidu/shared/features/authentication';
import { LOCAL_CUSTOMER_KEY, clearCustomer } from '@kaidu/shared/features/local-storage';
import { isFilledArray } from '@kaidu/shared/utils/array';
import { useSWRConfig } from 'swr';
// import { Text } from '@kaidu/shared/components/atomic/Text';
import { STACK_SCREENS} from '../../../domain/navigation/routes';
import { resetToHome} from '../../../domain/navigation/processors';

export function CustomerContentConatiner(props) {
  const { targetRoute, onReset, ...rest } = props;
  // Hooks
  const { isAuthValid, isLoading: isLoadingAuth, data: loginData } = useAuthFromLocalStorage();
  // console.log("file: CustomerScreen.tsx:22 ~ CustomerContentConatiner ~ loginData:", loginData);

  const navigation = useNavigation();
  const {
    customersList,
    selectedCustomer,
    isLoading: isLoadingCustomer,
    error: customerError,
  } = useCustomerData();
  // const { thirdPartyId } = loginData || {};
  const {
    data: userData,
    isLoading: isLoadingUser,
    isError: userError,
  } = useUsersList(isAuthValid);

  /**
   * 
   */
  const defaultCustomerID = useMemo(() => {
    if (selectedCustomer && isFilledArray(customersList)) {
      const found = customersList.find(item => item?.customer_id === selectedCustomer.customer_id);
      if (found) {
        return selectedCustomer.customer_id;
      } else {
        return customersList[0].customer_id;
      }
    }

    if (isFilledArray(customersList)) {
      return customersList[0].customer_id;
    }
    return null;
  }, [selectedCustomer, customersList]);

  if (isLoadingCustomer || isLoadingUser || isLoadingAuth) {
    return <CenteredSpinner text="Loading..." />;
  }

  const error = customerError || userError;
  if (error) {
    console.error('Error loading customer data', error);
    return (
      <ErrorModal
        errorMsg={error?.message}
        onCancel={onReset}
        isVisible={Boolean(error)}
      />
    );
  }

  if (!defaultCustomerID) {
    return (
      <ErrorModal
        errorMsg={
          'You cannot access any site. Please contact Kaidu for technical support.'
        }
        onCancel={onReset}
        isVisible={!defaultCustomerID}
      />
    );
  }

  return (
    <ScreenWrapper>
      <View
        style={[tailwind('p-8'), { flex: 1, paddingTop: verticalScale(48) }]}>
        <H2 style={tailwind('mb-12')}>Pick the site</H2>
        <CustomerSelect
          customersList={customersList}
          defaultValue={defaultCustomerID}
          user={userData}
          onFulfilled={() => navigation.navigate(STACK_SCREENS.HOME)}
          key={userData?.user_id + defaultCustomerID}
        />
      </View>
    </ScreenWrapper>
  );

}

/**
 * A screen for selecting target customer
 */
export function CustomerScreen(props) {
  const navigation = useNavigation();
  const { mutate } = useSWRConfig();

  const handleResetError = () => {
    console.debug('Cancel is pressed');
    clearCustomer().then(() => {
      mutate(LOCAL_CUSTOMER_KEY);
      //XXXDC change from Login to Home
      //navigation.dispatch(resetToLogin);
      navigation.dispatch(resetToHome);
      //XXXDC end changes
    });
  };

  return (
    <ReactNativeErrorBoundary onReset={handleResetError}>
      <CustomerContentConatiner onReset={handleResetError} {...props} />
    </ReactNativeErrorBoundary>
  );
}
