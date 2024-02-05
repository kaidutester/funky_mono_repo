import _ from 'lodash';
import { replaceEmptyStringWithNull, trimObjectProperties } from '@kaidu/shared/utils';
import { BuildingDTO, FloorDTO, LocationDTO } from '../types';
import { LOCATION_PROPS, FLOOR_PROPS, BUILDING_PROPS } from '../types';
// import { CustomersDeviceData } from '~/types';
import { CustomersDeviceData } from '@kaidu/shared/features/kaidu-server';
import {
  addIdsToCustomerDeviceData,
  postNewPreconfiguration,
} from '@kaidu/shared/features/kaidu-server/customers-device-data';

export function processSubmittedLocation(data) {
  const trimmed = trimObjectProperties(data);
  const replaced = replaceEmptyStringWithNull(trimmed);
  const result: LocationDTO = _.pick(replaced, LOCATION_PROPS) as any;
  return result;
}

export function processSubmittedFloor(data) {
  const trimmed = trimObjectProperties(data);
  const replaced = replaceEmptyStringWithNull(trimmed);
  const result: FloorDTO = _.pick(replaced, FLOOR_PROPS) as any;
  return result;
}

export function processSubmittedBuilding(data) {
  const trimmed = trimObjectProperties(data);
  const replaced = replaceEmptyStringWithNull(trimmed);
  const result: BuildingDTO = _.pick(replaced, BUILDING_PROPS) as any;
  return result;
}

export function checkIsPreconfigIncluded(
  data: {
    building: string | null;
    location: string | null;
    floor: string | null;
    wifi_ssid: string | null;
    wifi_password: string | null;
    [x: string]: any;
  },
  preconfigList: CustomersDeviceData[]
) {
  //check building, floor, location, ssid, password
  const conditions = (item) => {
    return (
      item.wifi_ssid === data.wifi_ssid &&
      item.wifi_password === data.wifi_password &&
      item.building === data.building &&
      item.floor === data.floor &&
      item.location === data.location
    );
  };

  const founds = preconfigList.filter(conditions);

  if (founds?.length > 0) {
    return founds[0];
  }

  return null;
}

export function hasItem(item: any, allPreconfigs: any[]) {
  return;
}

export async function processAndWritePreconfig(
  data,
  allCustomerDeviceData,
  rawCustomersList
) {
  // If a new configuration field value is created, create a new pre-configuration item
  const existingPreconfigItem = checkIsPreconfigIncluded(
    data,
    allCustomerDeviceData
  );

  if (!existingPreconfigItem) {
    const submittedPreconfig = addIdsToCustomerDeviceData(
      data,
      rawCustomersList
    );
    const responsePreconfig = await postNewPreconfiguration(
      submittedPreconfig,
      1
    );
    return responsePreconfig;
  }
  return null;
}
