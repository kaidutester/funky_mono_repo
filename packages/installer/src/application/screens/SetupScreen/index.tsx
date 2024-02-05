import ActivityIndicator from '~/components/atomic/ActivityIndicator';
import React, { useEffect } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSetupScreenData } from '~/hooks/useScreenData';
import { tailwind } from '@kaidu/shared/lib/styles';
import SetupMainContainer from './organism/SetupMainContainer';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ErrorModal } from '@kaidu/shared/domain/error-handling/components';
import { BasicTemplate } from '@kaidu/shared/components/template/BasicTemplate';

/**
 * Key Params: device name, customer name, building, floor, location, wifi ssid, wifi password;
 * Non editable: mac address, mqtt device id, mqtt device certificate
 */
export default function SetupScreen(props) {
  // Pull & preprocess data for Setup
  // console.debug(`SetupScreen is rendered`);

  // Hooks
  const navigation = useNavigation();
  const route = useRoute();
  const { uuid, kaidu_device_id, mac_address, bleId, mac } = route?.params as any || {};

  const {
    serverConfig,
    customerNames,
    rawCustomersList,
    buildings,
    floors,
    locations,
    rssiThresholdList,
    isLoading,
    isError,
  } = useSetupScreenData(mac);

  useEffect(() => {
    // assign configuration data in server as default values for params if it exists
    // only set params if it is not initialized yet

    // use mac_address from params to determine if it's set once
    if (serverConfig && !kaidu_device_id && !mac_address && !isLoading) {
      console.debug(`Found existing device configuration but not kaidu_device_id`);
      console.debug(`server config customer name: ${serverConfig?.customer_name}`);
      //@ts-ignore
      navigation.setParams(serverConfig);
    }
  }, [serverConfig]);

  if (isError) {
    console.error(isError?.message);
    return <ErrorModal errorMsg={`Failed to fetch data ${isError?.message}`} onCancel={() => navigation.goBack()} />;
  }
  if (isLoading) return <ActivityIndicator text={'Loading configuration...'} />;

  const { customer_name, mqtt_device_certificate, mqtt_device_id, device_name, wifi_ssid, wifi_password } = serverConfig || {};
  const defaultCustomerID = rawCustomersList?.find((item) => item?.customer_name === customer_name)?.customer_id;

  return (
    <BasicTemplate accessibilityLabel="Setup Screen">
      <KeyboardAwareScrollView style={tailwind('pt-5')}>
        <SetupMainContainer
          {...{
            serverConfig,
            // customerDeviceData,
          }}
          defaultValues={{ customer_name, device_name, wifi_ssid, wifi_password, customer_id: defaultCustomerID }}
          fixedValues={{ mqtt_device_certificate, mqtt_device_id, uuid, mac, bleId }}
          optionsList={{
            customerNames,
            rawCustomersList,
            buildings,
            floors,
            locations,
            rssiThresholdList,
          }}
        />
      </KeyboardAwareScrollView>
    </BasicTemplate>
  );
}
