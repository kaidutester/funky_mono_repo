import { getAxiosDefaultAuthHeader } from '@kaidu/shared/features/axios';
import { writeConfigToDevice } from '@kaidu/shared/features/ble-kaidu';
import {
  findCustomerByName
} from '@kaidu/shared/features/kaidu-server';
import { addWifiStorage, Wifi } from '@kaidu/shared/features/wifi';
import { updateSetupState } from '@kaidu/shared/lib/redux/setupSlice';
import { inspect } from '@kaidu/shared/utils';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { useSWRConfig } from 'swr';
import ActivityIndicator from '~/components/atomic/ActivityIndicator';
import Popup from '~/components/atomic/Popup';
import { ErrorModal } from '@kaidu/shared/domain/error-handling/components';
import ServerConfigForm from '~/components/organism/ServerConfigForm';
import {
  hasAllPreconfigIds
} from '~/features/pre-configs';
import { disconnectConnectedDeviceThunk } from '@kaidu/shared/providers/ble-devices';
// import ServerConfigForm from '@kaidu/shared/components/organism/ServerConfigForm';
import { STACK_SCREENS } from '~/navigation/routes';
import { ConfigurationInServer } from '~/types/interfaces';
import { createNoAccessTokenError, writeConfigurationToServer, writePreConfigs } from './processors';

/**
 * Handle the form of Kaidu scanner configuration
 */
export function SetupMainContainer({
  serverConfig,
  optionsList,
  defaultValues,
  fixedValues,
  ...optionals
}: {
  serverConfig: ConfigurationInServer;
  [x: string]: any;
}) {
  // handle issues after user pressed submit button
  // input sources: server configuration, form data, route params
  // should use server configuration to set default route params
  // use form data to validate only
  console.debug(`SetupController is rendered`);
  const { rawCustomersList } = optionsList || {};
  const { uuid, mac, bleId } = fixedValues || {};

  //Optional props
  const { ...rest } = optionals;

  // Hooks
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { mutate } = useSWRConfig();

  // State
  const [openConfirmPopup, setOpenConfirmPopup] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('idle');
  const [errorMsg, setErrorMsg] = useState({ name: '', message: '' });

  const submittedData = useRef<ConfigurationInServer | null>(null); //store data before confirmed submission

  const handleSubmit = (data) => {
    // submit btn is pressed, store form data before confirming
    submittedData.current = data;
    console.debug(`Submitted input: ${inspect(data)}`);
    setStatus('toConfirm');
  };

  const handleConfirm = (data) => {
    // do data validation
    // called by user confirmed at the popup

    // Validation
    if (data === null) {
      Alert.alert('No data is being submitted');
      return;
    }

    console.debug(`Confirm data: ${inspect(data)}. Type: ${typeof data}`);
    setOpenConfirmPopup(false);
    setStatus('confirmed');
  };

  const handleWrite = async () => {
    // send requests to server & device when it's confirmed

    // Get input
    const data = submittedData.current as any;
    const { customer_name } = data || {};
    const { customer_id: customers_list_id } =
      findCustomerByName(rawCustomersList, customer_name) || {};
    console.debug(`handleWrite input data: ${inspect(data)}`);

    // Validation
    if (!getAxiosDefaultAuthHeader()) {
      const tokenError = createNoAccessTokenError();
      throw tokenError;
    }

    let combined = Object.assign({}, serverConfig, data);

    // write preconfig
    const hasNewPreconfig = !hasAllPreconfigIds(data);
    if (hasNewPreconfig) {
      const preconfigRes = await writePreConfigs(data, customers_list_id);
      Object.assign(combined, preconfigRes);
    }

    // write kaidu configuration
    const response1 = await writeConfigurationToServer(combined, customers_list_id);

    console.debug('Start to write configuration data to BLE device');
    const response2 = await writeConfigToDevice(bleId, data);

    // add wifi to async storage
    const { wifi_ssid, wifi_password } = data || {};
    const wifi: Wifi = { ssid: wifi_ssid, password: wifi_password };
    await addWifiStorage(wifi);

    // update data finished
    return response2 || response1;
  };

  const handleCancelOnConfirm = () => {
    setOpenConfirmPopup(false);
    setStatus('idle');
  };

  useEffect(() => {
    if (status === 'toConfirm') {
      setOpenConfirmPopup(true);
    }

    if (status === 'confirmed') {
      setStatus('pending');
      handleWrite()
        .then((res) => {
          dispatch(disconnectConnectedDeviceThunk(bleId));
          setStatus('fulfilled');
          dispatch(updateSetupState('fulfilled'));
          navigation?.push(STACK_SCREENS.HOME);
        })
        .catch((error) => {
          console.error(`catch error: ${error.message}`);
          console.trace(error);
          // setErrorMsg({name: 'test name', message: 'test message'});
          setErrorMsg({ name: error?.name, message: error?.message });
          setStatus('rejected');
        });
    }

    if (status === 'fulfilled') {
      // go back to home screen
      // setStatus('idle');
      navigation?.push(STACK_SCREENS.HOME);
    }

    if (status === 'rejected') {
      dispatch(disconnectConnectedDeviceThunk(bleId));
    }
  }, [status]);

  return (
    <>
      {status === 'pending' && (
        <ActivityIndicator
          text={'updating configuration in server and scanner...'}
        />
      )}
      {status !== 'confirmed' && status !== 'pending' && (
        <>
          <ServerConfigForm
            onSubmit={handleSubmit}
            optionsList={optionsList}
            defaultValues={defaultValues}
            fixedValues={fixedValues}
          />
          <Popup
            visible={openConfirmPopup}
            onConfirm={() => handleConfirm(submittedData.current)}
            text={`Submit this changed configuration to the server? Your Kaidu Scanner will update and reboot.`}
            showCancel={true}
            onCancel={handleCancelOnConfirm}
          />
        </>
      )}
      {status === 'rejected' && (
        <ErrorModal
          errorMsg={`${errorMsg?.name ?? 'UNKNOWN ERROR'}! ${errorMsg?.message
            }`}
          onCancel={() => setStatus('idle')}
        />
      )}
    </>
  );
}

export default SetupMainContainer;
