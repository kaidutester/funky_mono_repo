import useSWR from 'swr';
import {
  // useCustomersDeviceData,
  useCustomersList,
  useMQTTConfigurationsList,
  useSingleCustomerDeviceData,
  useRSSIThresholdList,
} from '@kaidu/shared/features/kaidu-server';
import { inspect } from '@kaidu/shared/utils';
import { useSelector } from 'react-redux';
import { selectWiFiPassword, Wifi } from '../lib/redux/wifiSlice';
import { useAsyncStorage } from '@kaidu/shared/features/local-storage';
import _ from 'lodash';
import WifiManager from 'react-native-wifi-reborn';
import { useKaiduConfigItem, useKaiduConfigByMac, useBuildingPreconfigs, useFloorPreconfigs, useLocationPreconfigs } from '@kaidu/shared/features/kaidu-server';
import { HISTORY_STORAGE_KEY } from '@kaidu/shared/features/wifi';

/**
 * Get existing config, customer list, building/floor/location list
 */
export function useSetupScreenData(macAddress: string) {
  // 

  console.debug(`useSetupScreenData called with mac address: ${macAddress}`);
  const { data: serverConfig, isLoading: isServerConfigLoading,
    isError: isServerConfigError, } = useKaiduConfigItem(macAddress, { revalidateOnFocus: false });

  isServerConfigError && console.error(`Server Config Error ${isServerConfigError?.message}`);

  const {
    customersList: rawCustomersList,
    isLoading: isCustomersListLoading,
    isError: isCustomersListError,
    customerNames,
  } = useCustomersList();
  isCustomersListError && console.error(`Customer list Error ${isCustomersListError?.message}`);
  rawCustomersList && console.debug(`Fetched ${rawCustomersList?.length} customers in useSetupScreenData`);

  const { data: kaiduDeviceConfig } = useKaiduConfigByMac(macAddress);
  const {
    mqttConfigList,
    isLoading: isMQTTConfigListLoading,
    isError: isMQTTConfigListError,
  } = useMQTTConfigurationsList();

  // Pre-configs
  const { buildings, isLoadingBuildings, isBuildingsError } = useBuildingPreconfigs();
  const { floors, isLoadingFloors, isFloorsError } = useFloorPreconfigs();
  const { locations, isLoadingLocations, isLocationsError } = useLocationPreconfigs();
  const {data: rssiThresholdList, isLoading: isLoadingRssiThreshold, isError: isRssiThresholdError} = useRSSIThresholdList();
  isBuildingsError && console.error(`Customers Building Error ${isBuildingsError?.message}`);
  isFloorsError && console.error(`Customers Floor Error ${isFloorsError?.message}`);
  isLocationsError && console.error(`Customers Location Error ${isLocationsError?.message}`);
  isRssiThresholdError && console.error(`RSSI Threshold Error ${isRssiThresholdError?.message}`);
  // return testResult;

  let customer_name;
  if (serverConfig) {
    customer_name = rawCustomersList?.find(item => item?.customer_id === serverConfig?.customer_list_id)?.customer_name;
    console.debug(`Found customer_name: ${customer_name}`);

    if (serverConfig && !serverConfig?.mac_address) {
      // if the server config doesn't return mac_address, assign it
      serverConfig.mac_address = macAddress;
    }
  }

  let newMQTT;
  if (kaiduDeviceConfig) {
    const { mqtt_device_id, mqtt_device_certificate, customer_name: fetchedCustomerName } = kaiduDeviceConfig || {};

    const mqtt_configuration_id = mqttConfigList?.find(item => item?.mqtt_device_id === mqtt_device_id)?.mqtt_configuration_id;
    console.debug(`Get new mqtt_device_id ${mqtt_device_id}`);

    newMQTT = { mqtt_device_id, mqtt_device_certificate, mqtt_configuration_id };
  }


  buildings && floors && locations && console.debug(`Fetched ${buildings?.length} buildings, ${floors?.length} floors, ${locations?.length} locations on Setup screen`);
  customerNames && console.debug(`Fetched ${customerNames?.length} customers on Setup screen`);

  return {
    serverConfig: newMQTT ? { ...serverConfig, customer_name, ...newMQTT } : { ...serverConfig, customer_name },
    customerNames,
    rawCustomersList,
    buildings,
    floors,
    locations,
    rssiThresholdList,
    isLoading:
      isServerConfigLoading ||
      isCustomersListLoading || isLoadingBuildings || isLoadingFloors || isLoadingLocations || isMQTTConfigListLoading || isLoadingRssiThreshold,
    isError:
      isCustomersListError || isServerConfigError || isBuildingsError || isFloorsError || isLocationsError || isMQTTConfigListError,
  };
}

// return matched wifi from global state, async storage or server
// ssid is in global state(current connected)
export function useMatchedWifi(customerName: string, ssid: string) {
  const pw = useSelector(selectWiFiPassword);
  console.debug(`useMatchedWifi wifi ssid: ${ssid}; wifi password: ${pw}`);

  const hasPW = Boolean(_.trim(pw));
  if (hasPW) {
    // if global state has password
    return {
      ssid: ssid,
      password: pw,
      isLoading: null,
      isError: null,
    };
  }

  // if global state doesn't has password
  // retrieve it
  const {
    devicesOfCustomer,
    isLoading: isConfigServerLoading,
    isError: isConfigServerError,
  } = useSingleCustomerDeviceData(customerName);

  const { data: wifiInAS, error: ASError } = useAsyncStorage(HISTORY_STORAGE_KEY);
  console.debug(`wifiInAS: ${inspect(wifiInAS)}`);
  console.debug(`type of wifiInAS: ${typeof wifiInAS}`);

  let matchedPw; // look up password at server and local storage

  if (devicesOfCustomer) {
    // if wifi setting is stored in Kaidu server customer devices data
    const matchedWifi = devicesOfCustomer.find(item => item?.wifi_ssid === ssid);
    if (matchedWifi) {
      matchedPw = matchedWifi?.wifi_password;
    }
  }

  if (wifiInAS) {
    console.debug('@wifis in async storage exists');
    const matchedWifi = wifiInAS.find(item => item.ssid === ssid);
    if (matchedWifi) {
      matchedPw = matchedWifi.password;
    }
  }

  const NoPasswordError = !pw && !matchedPw && pw !== '' && matchedPw !== '';

  return {
    ssid: ssid,
    password: matchedPw,
    isLoading: isConfigServerLoading,
    isError: isConfigServerError || ASError || NoPasswordError,
  };
}

export function usePreconfigWifiList(customerName: string) {
  //sources: preconfig wifis, local history, scanned available wifis
  //priority: user defined setting > preconfig wifis
  const {
    devicesOfCustomer,
    isLoading: isConfigServerLoading,
    isError: isConfigServerError,
  } = useSingleCustomerDeviceData(customerName);

  const { data: nearbyWifis, error: loadWifiListError } = useSWR('wifis', () =>
    WifiManager.loadWifiList(),
  );

  let wifiList = [] as Wifi[];
  if (nearbyWifis && devicesOfCustomer) {
    const usefulNearbyWifis = _.sortBy(
      _.uniqBy(nearbyWifis, 'SSID').map(scannedWifi => {
        return { ssid: scannedWifi?.SSID, rssi: scannedWifi?.level };
      }),
      ['rssi'],
    ).reverse();

    console.debug(
      `usefulNearbyWifis (sorted by rssi level): ${inspect(
        usefulNearbyWifis,
      )}`,
    );

    // preconfig wifis should only contain unique, not null wifi settings
    const preconfigWifis = _.sortBy(_.uniqWith(devicesOfCustomer, (v1, v2) =>
      _.isEqual(
        [v1?.wifi_ssid, v1?.wifi_password].join(),
        [v2?.wifi_ssid, v2?.wifi_password].join(),
      ),
    )
      .map(item => {
        return { ssid: item?.wifi_ssid, password: item?.wifi_password };
      })
      .filter(wifi => wifi.ssid !== null), ['ssid']);
    // console.debug(`preconfigWifis: ${helpers.inspect(preconfigWifis)}`);

    //sort wifi list by rssi level
    const filtered = _.flatten(
      usefulNearbyWifis.map(wifi =>
        preconfigWifis.filter(
          preconfigWifi => preconfigWifi.ssid === wifi.ssid,
        ),
      ),
    );
    console.debug(`filtered: ${inspect(filtered)}`);
    const concated = _.uniq(filtered.concat(preconfigWifis));
    // console.debug(`concated: ${helpers.inspect(concated)}`);
    wifiList = concated;
  }

  return {
    wifiList,
    isLoading: isConfigServerLoading,
    isError: isConfigServerError || loadWifiListError,
  };
}