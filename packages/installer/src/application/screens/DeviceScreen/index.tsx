import React, { useState, useEffect } from 'react';
import Button from '../../../components/atomic/Button';
import {
  connectToDevice,
  isDeviceConnected,
  cancelConnection,
} from '@kaidu/shared/features/ble-general';
import { MultiItemsRow } from '../../../components/atomic/Layouts';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectConnectedDeviceId,
  updateDeviceStatistics,
  selectDeviceStatistics,
  updateConnectedDeviceId,
  cleanUpScannedDevices,
} from '@kaidu/shared/providers/ble-devices/deviceSlice';
import SetupNavigateBtn from '../../../components/molecule/SetupNavigateBtn';
import ActivityIndicator from '../../../components/atomic/ActivityIndicator';
import { DeviceStatistics, Version } from '~/types/interfaces';
import { Wrapper, HalfLine } from './styles/Styleds';
import ScrollView from '../../../components/atomic/ScrollView';
import { DisconnectBtn } from '../../../components/molecule/DisconnectBtn';
import { DeviceDataView } from './DeviceDataView';
import { STACK_SCREENS } from '~/navigation/routes';
import BLEIcon from './BLEIcon';
import { StackNavigationProp } from '@react-navigation/stack';
import { useRoute } from '@react-navigation/native';
import { ErrorModal } from '@kaidu/shared/domain/error-handling/components/ErrorModal';
import { useDeviceScreenData } from './hooks';
import { fetchDeviceData } from '@kaidu/shared/features/ble-kaidu';
import { ScreenWrapper } from '@kaidu/shared/components/headless/ScreenWrapper';
import { BasicTemplate } from '@kaidu/shared/components/template/BasicTemplate';

export default function DeviceScreenWrapper(props) {
  return (
    <ScreenWrapper>
      <DeviceScreen {...props} />
    </ScreenWrapper>
  );
}

// Data from BLE device: connection, MQTT Device ID, MQTT Certificate, firmware version, Wifi SSID, Wifi Password
// Data from config server: MQTT Device ID, MQTT Certificate,
/**
 * A screen for various operations to a connected device
 * fetch and display data from BLE device
 */
export function DeviceScreen(props) {

  // should connect to BLE when navigate to DeviceScreen
  // should disconnect when user press the disconnect btn

  // fetch:
  // 1. configuration data from server,
  // 2. connect to scanner, discover and read statistics and other data,

  // required data: mqtt certificate, mqtt device id, device name

  //Hooks
  const route = useRoute();
  const { macAddress, bleId } = route.params as any;
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<any, any>>();

  const {
    data: serverConfig,
    isLoading: isServerConfigLoading,
    isError: isServerConfigError,
  } = useDeviceScreenData(macAddress);

  //Global states
  const connectedDeviceId = useSelector(selectConnectedDeviceId);
  const statistics: DeviceStatistics = useSelector(selectDeviceStatistics);

  //Local states
  const [bleStatus, setBleStatus] = useState('idle');
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [errorMsg, setErrorMsg] = useState('');
  const [timeoutID, setTimeoutID] = useState<NodeJS.Timeout | null>(null);
  const [MQTTDeviceId, setMQTTDeviceId] = useState<string>('');
  const [MQTTCert, setMQTTCert] = useState<string>('');
  const [version, setVersion] = useState<Version>({ hw: '0', sw: '0' });
  const [MQTTCertColor, setMQTTCertColor] = useState('normal');
  const [MQTTIdColor, setMQTTIdColor] = useState('normal');
  const [WiFiSsid, setWiFiSsid] = useState<string>('');
  const [WiFiPW, setWiFiPW] = useState<string>('');

  useEffect(() => {
    navigation.addListener('beforeRemove', (e) => {
      console.debug('Leaving DeviceScreen');
      cancelConnection(bleId);
      dispatch(cleanUpScannedDevices());
    });
  }, []);

  useEffect(() => {
    //connect to Scanner via BLE when mounted
    let isMounted = true;
    try {
      console.debug(`BLE status -> connecting`);
      // if it's pending > 40s, go back to previous screen
      const timeoutID = setTimeout(() => {
        navigation.pop();
      }, 40 * 1000);
      setTimeoutID(timeoutID);

      if (isMounted) {
        setBleStatus('connecting');
        setLoadingMsg('Connecting to device');
      }

      const foo = async (bleID) => {
        // check connection and update connected device id
        const isConnected = await isDeviceConnected(bleID);
        if (isConnected && isMounted && bleID !== connectedDeviceId) {
          console.debug(`Device ${bleID} is connected`);
          dispatch(updateConnectedDeviceId(bleID));
        } else {
          const isDeviceConnected = await connectToDevice(bleID, 3);
          isMounted &&
            isDeviceConnected &&
            dispatch(updateConnectedDeviceId(bleID));
        }
      };

      foo(bleId)
        .then(() => {
          if (isMounted) {
            setBleStatus('connected');

            console.debug(`BLE status -> connected`);
          }
        })
        .catch((error) => {
          throw error;
        });
    } catch (error) {
      if (isMounted) {
        setBleStatus('rejected');
        const errMsg = error?.message;
        setErrorMsg(errMsg);
        console.debug(`Error keys: ${Object.keys(errMsg)}`);
        console.error(`connection failure: ${errMsg}`);
      }
    }

    return function cleanup() {
      isMounted = false;
    };
  }, [bleId]);

  // execute workflow by the ble status
  useEffect(() => {
    let isMounted = true;
    if (bleStatus === 'rejected' || bleStatus === 'resolved') {
      timeoutID && clearTimeout(timeoutID);
    }

    if (bleStatus === 'connected') {
      // discover and read statistics and other data
      if (isMounted) {
        setBleStatus('fetching');
        setLoadingMsg('Reading data from scanner via BLE... Please wait 10s');
      }
    }

    if (bleStatus === 'fetching') {
      fetchDeviceData(bleId)
        .then((res: any) => {
          console.debug(`fetchDeviceData is fulfilled`);
          const { wiFi_ssid, wiFi_password, infoObj } = res || {};
          const { mqttDeviceId, version, mqttCert, statistics } = infoObj || {};

          if (isMounted) {
            setBleStatus('resolved');
            setWiFiSsid(wiFi_ssid);
            setWiFiPW(wiFi_password);

            if (version) {
              mqttDeviceId && setMQTTDeviceId(mqttDeviceId);
              mqttCert && setMQTTCert(mqttCert);
              setVersion(version);
              dispatch(updateDeviceStatistics(statistics));
            }
          }
        })
        .catch((err) => {
          console.error(`fetchDeviceData is rejected: ${err}`);
          if (isMounted) {
            console.error(err?.message);
            setBleStatus('rejected');
          }
        });
    }

    return function cleanup() {
      isMounted = false;
    };
  }, [bleStatus]);

  useEffect(() => {
    //compare device mqtt to server mqtt
    let isCancelled = false;

    const isMQTTCertInconsistent =
      MQTTCert && MQTTCert !== serverConfig?.mqtt_device_certificate;
    const isMQTTIdInconsistent =
      MQTTDeviceId && MQTTDeviceId !== serverConfig?.mqtt_device_id;

    if (isMQTTCertInconsistent && !isCancelled) {
      console.debug(
        `MQTT cert is inconsistent. server: ${serverConfig?.mqtt_device_certificate}`
      );
      setMQTTCertColor('inconsistent');
    }

    if (isMQTTIdInconsistent && !isCancelled) {
      console.debug(
        `MQTT id is inconsistent. server: ${serverConfig?.mqtt_device_id}`
      );
      setMQTTIdColor('inconsistent');
    }
  }, [MQTTCert]);

  const handleStatsPress = () => {
    console.debug(`Stats button Pressed`);
    navigation.navigate(STACK_SCREENS.JSON, {
      title: 'Statistics',
      data: statistics,
    });
  };

  const handleCancel = () => {
    cancelConnection(bleId);
    navigation.pop();
  };

  const handleDisconnected = () => {
    dispatch(cleanUpScannedDevices());
    navigation.navigate(STACK_SCREENS.HOME);
  };

  if (
    (bleStatus !== 'resolved' && bleStatus !== 'rejected') ||
    isServerConfigLoading
  ) {
    return (
      <ActivityIndicator text={loadingMsg}>
        <Button title={'Cancel'} onPress={handleCancel} />
      </ActivityIndicator>
    );
  } else if (bleStatus === 'rejected') {
    return <ErrorModal errorMsg={errorMsg} onCancel={handleCancel} />;
  } else if (isServerConfigError) {
    console.error(`fetch server config error: ${isServerConfigError?.message}`);
    // return (
    //   <ErrorModal
    //     errorMsg={isServerConfigError?.message}
    //     onCancel={() => navigation.pop()}
    //   />
    // );
  }

  const processedWifiPw = WiFiPW.replace(/\x00/g, '').trim();

  return (
    <BasicTemplate accessibilityLabel={'Device Screen'} testID='Device Screen'>
      <ScrollView accessibilityLabel={'Device Scroll View'}>
        <Wrapper>
          <DeviceDataView
            deviceName={serverConfig?.device_name}
            beaconStatus={statistics ? statistics?.beacon_status : null}
            MQTTDeviceId={MQTTDeviceId}
            MQTTCert={MQTTCert}
            isMQTTIdConsistent={MQTTIdColor !== 'inconsistent'}
            isMQTTCertConsistent={MQTTCertColor !== 'inconsistent'}
            wifiSsid={WiFiSsid}
            wifiPw={processedWifiPw}
            version={version}
          />
          <MultiItemsRow>
            <HalfLine>
              <SetupNavigateBtn
                macAddress={macAddress}
                uuid={bleId}
                bleId={bleId}
              />
            </HalfLine>
            <HalfLine>
              <Button
                title={`Stats`}
                onPress={handleStatsPress}
                disabled={statistics === null || statistics === undefined}
              />
            </HalfLine>
          </MultiItemsRow>
          <MultiItemsRow>
            <HalfLine>
              <Button
                title={'OTA'}
                onPress={() =>
                  navigation.navigate(STACK_SCREENS.OTA, {
                    ...{ version, deviceId: macAddress, bleId },
                  })
                }
              />
            </HalfLine>
            <HalfLine>
              <DisconnectBtn
                deviceId={bleId}
                onDisconnected={handleDisconnected}
              >
                <BLEIcon isConnected={Boolean(connectedDeviceId)} />
              </DisconnectBtn>
            </HalfLine>
          </MultiItemsRow>
        </Wrapper>
      </ScrollView>
    </BasicTemplate>
  );
}
