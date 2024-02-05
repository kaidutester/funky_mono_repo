import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View } from '@kaidu/shared/components/atomic/View';
import { Heading } from '@kaidu/shared/components/atomic/Heading';
import { useKaiduConfigByMac } from '@kaidu/shared/features/kaidu-server/kaidu-device-configuration';
import { clearSetup, updateSetupState } from '@kaidu/shared/lib/redux/setupSlice';

const timeoutErr = new Error('The server is taking too long to response. Please try again later.');
const configServerErr = new Error('Failed to fetch configuration data from Kaidu server. Please try again later.');

function composeData(config, customerId: string, device_name: string) {
  const {
    kaidu_configuration_id,
    mqtt_device_id,
    mqtt_device_certificate,
    mac_address
    // customer_name: customerNameInConfig,
    // customer_id: customerIDInConfig,
  } = config || {};

  // only use kaidu_device_configuration API
  if (kaidu_configuration_id) {
    console.debug(`Retrieved configuration id: ${kaidu_configuration_id}`);

    return {
      kaidu_configuration_id,
      mqtt_device_id,
      mqtt_device_certificate,
      customer_id: customerId,
      mac_address: mac_address,
      device_name,
    };
  } else {
    // no existing configuration, omit configuration id
    return {
      customer_id: customerId,
      mac_address: mac_address,
      device_name,
      mqtt_device_id,
      mqtt_device_certificate,
    };
  }
}

/**
 * fetch exisiting configuration from server. if not, use a new configuration with mqtt, else, fetch the cusotmer device data
 */
export function Retriever({
  macAddress,
  customerId,
  device_name,
  onFulfilled,
  onRejected,
  ...optionals
}: {
  macAddress: string;
  [x: string]: any
}) {

  const dispatch = useDispatch();

  const { data: kaiduConfig, isLoading, isError: kaiduConfigError } = useKaiduConfigByMac(macAddress, {
    loadingTimeout: 6002
  });

  useEffect(() => {
    console.debug(`Retriever is mounted`);
    dispatch(clearSetup()); // clear setup state
    if (customerId && kaiduConfig && !kaiduConfigError) {
      // console.debug(`Retrieve customer: ${customer?.customer_name}`);
      const data = composeData(kaiduConfig, customerId, device_name);
      onFulfilled(data);
      return;
    }
  }, [kaiduConfig, kaiduConfigError]);

  if (isLoading) {
    return (
      <View>
        <Heading>Retrieving data from the server</Heading>
      </View>
    );
  }

  if (kaiduConfigError) {
    console.error(`Error in Retriever: ${kaiduConfigError?.message}`);
    //onRejected(configServerErr); //XXXDC removed
    return null;
  }

  return null;
}
