import {
  deleteKaiduConfigListItem,
  fetchKaiduConfigListByDeviceID,
  fetchKaiduConfigListItem,
  postBuilding,
  postFloor,
  postLocation,
  putKaiduConfig,
} from '@kaidu/shared/features/kaidu-server';
import {
  fetchCustomerDeviceDataList,
  fetchCustomersDeviceDataItem,
  postCustomersDeviceData,
} from '@kaidu/shared/features/kaidu-server/customers-device-data';
import {
  postKaiduConfigListItem,
  putKaiduConfigListItem,
} from '@kaidu/shared/features/kaidu-server/kaidu-configurations-list';
import { checkHaveSameProperties } from '@kaidu/shared/utils';
import _ from 'lodash';

export async function writePreConfigs(data, customers_list_id) {
  let {
    customers_building_id,
    customers_location_id,
    customers_floor_id,
    building,
    floor,
    location,
  } = data || {};

  let combined = Object.assign({}, data, {
    building_name: building,
    floor_name: floor,
    location_name: location,
    customers_list_id,
    customer_list_id: customers_list_id,
  });

  if (building && !customers_building_id) {
    const buildingItem = await postBuilding(combined);
    customers_building_id = buildingItem?.customers_building_id;
    Object.assign(combined, { customers_building_id });
  }
  if (floor && !customers_floor_id) {
    const floorItem = await postFloor(combined);
    customers_floor_id = floorItem?.customers_floor_id;
    Object.assign(combined, { customers_floor_id });
  }
  if (location && !customers_location_id) {
    const locationItem = await postLocation(combined);
    customers_location_id = locationItem?.customers_location_id;
    customers_location_id && Object.assign(combined, { customers_location_id });
  }

  return _.omit(combined, ['id']);
}

export async function writeConfigurationToServer(combined, customers_list_id) {
  console.debug('Start to write configuration data to server');
  Object.assign(combined, {
    customers_list_id,
    customer_list_id: customers_list_id,
    customer_id: customers_list_id,
  });
  let { kaidu_device_id, kaidu_configuration_id } = combined || {};
  const isNewDevice = !kaidu_device_id;

  if (isNewDevice) {
    console.debug(`No kaidu_device_id. This is a new device.`);
    const res4 = await putKaiduConfig(combined);
  } else {
    console.debug(`Got kaidu_device_id: ${kaidu_device_id}`);
    const linkedConfigList = await fetchKaiduConfigListByDeviceID(
      kaidu_device_id
    );
    const linkedCustomerDeviceDataList = await Promise.all(
      linkedConfigList?.map(
        async (config) =>
          await fetchCustomersDeviceDataItem(config?.customer_device_data_id)
      )
    );

    const isNextConfigLinked = findCustomerDeviceDataItem(
      linkedCustomerDeviceDataList,
      combined
    );

    if (linkedConfigList?.length > 0 && isNextConfigLinked) {
      console.debug('Next config is linked', isNextConfigLinked);
      // should we check if there are more than one?
      // should delete other configurations
    } else {
      console.debug('Next config is not linked');
      const foundNextConfigInServer =
        await findCustomerDeviceDataItemExistInServer(combined);
      if (foundNextConfigInServer) {
        console.debug('Next config is not linked but exist in server');
        const foundNextConfigInServerID =
          foundNextConfigInServer?.customer_device_data_id;

        if (linkedConfigList?.length > 0) {
          console.debug('Device has a linked config');
          const linkedKaiduConfigListItem = linkedConfigList[0];
          const res1 = await putKaiduConfigListItem({
            ...linkedKaiduConfigListItem,
            customer_device_data_id: foundNextConfigInServerID,
          });
        } else {
          console.debug('no linked kaidu_configuration_list item');
          const res2 = await postKaiduConfigListItem({
            ...combined,
            customer_device_data_id: foundNextConfigInServerID,
          });
        }
      } else {
        console.debug('Next config is not linked nor exists in server');
        if (linkedConfigList?.length > 1) {
          await Promise.all(
            linkedConfigList?.map(async (config, index) => {
              index &&
                (await deleteKaiduConfigListItem(
                  config?.kaidu_configuration_id
                ));
            })
          );
        }

        const nextCustomerDeviceData = await postCustomersDeviceData({
          ...combined,
        });

        const nextCustomerDeviceDataId =
          nextCustomerDeviceData?.customer_device_data_id;

        Object.assign(combined, {
          customer_device_data_id: nextCustomerDeviceDataId,
        });

        console.debug(
          `Next customer device data id: ${nextCustomerDeviceDataId}`
        );
        // requires kaidu_device_id, mqtt_configuration_id, customer_list_id, customer_device_data_id
        if (linkedConfigList?.length > 0) {
          console.debug('Device has a linked config');
          const linkedKaiduConfigListItem = linkedConfigList[0];
          const res1 = await putKaiduConfigListItem({
            ...linkedKaiduConfigListItem,
            customer_device_data_id: nextCustomerDeviceDataId,
          });
        } else {
          console.debug('no linked kaidu_configuration_list item');
          const res2 = await postKaiduConfigListItem({
            ...combined,
            customer_device_data_id: nextCustomerDeviceDataId,
          });
        }
      }
    }
  }
}

export function findCustomerDeviceDataItem(list, obj) {
  console.debug('findCustomerDeviceDataItem obj', obj);
  const itemToBeFound = _.pick(obj, [
    'customer_id',
    'wifi_ssid',
    'customers_building_id',
    'customers_floor_id',
    'customers_location_id',
    'rssi_thresholds_id',
  ]);
  const found = list?.find((item) =>
    checkHaveSameProperties(item, itemToBeFound)
  );
  return found;
}

export function createNoAccessTokenError() {
  const tokenError = new Error(
    'Access token not found. Please login before sending data to the server'
  );
  tokenError.name = 'No Access Token';
  return tokenError;
}

/**
 * @description return if the configuration (the combination of customer, building, floor, location, wifi_ssid, rssi threshold) is already in the server
 * @returns Found Customer Device Data Item or undefined
 */
export async function findCustomerDeviceDataItemExistInServer(input) {
  const combination = _.pick(input, [
    'customer_id',
    'customers_building_id',
    'customers_floor_id',
    'customers_location_id',
    'rssi_thresholds_id',
    'wifi_ssid',
  ]);
  const customerDeviceDataList = await fetchCustomerDeviceDataList();
  const found = findCustomerDeviceDataItem(customerDeviceDataList, combination);
  return found;
}

export async function configNewKaiduDeviceByKaiduConfigList() {
  // fetch customers_device_data list
  // found the next config in customers_device_data list
  // if (found)
  //     link to it
  // else
  //     post a new customers_device_data
  // POST to kaidu device list
  // kaiduDeviceListRes = await postKaiduDevicesList(combined);
  // Object.assign(combined, {
  //   kaidu_device_id: kaiduDeviceListRes?.data?.kaidu_device_id,
  // });
  // const foundCustomerDeviceData = checkIsCustomerDeviceDataItemExist(combined);
}

// return;
// if (!combined?.mqtt_configuration_id) {
//   const allMQTTConfigs = (await fetchMQTTConfigList()) as any;
//   const found = findMQTTItemByMQTTId(
//     allMQTTConfigs,
//     combined?.mqtt_device_id
//   );
//   found &&
//     Object.assign(combined, {
//       mqtt_configuration_id: found?.mqtt_configuration_id,
//     });
// }
