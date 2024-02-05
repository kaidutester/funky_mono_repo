import axios from 'axios';
import { PRE_CONFIG_APIS } from './constants';
import { helpers } from '~/utils';
import { handle } from '@kaidu/shared/utils';
import { getErrorMessageInResponse } from '@kaidu/shared/features/kaidu-server';
import {
  processSubmittedBuilding,
  processSubmittedFloor,
  processSubmittedLocation,
} from '../lib';
import { BuildingDTO, FloorDTO, LocationDTO } from '../types';
import _ from 'lodash';
// import { getAxiosDefaultAuthHeader } from '@kaidu/shared/features/axios';

export async function sendPost(url, data) {
  const handler = axios.post(url, data);
  const [result, resultErr] = await handle(handler);

  if (resultErr) {
    console.error(`sendPost to url ${url} returns error ${resultErr?.message}`);
    throw new Error(getErrorMessageInResponse(resultErr));
  }
  return result;
}

export async function postLocation(data) {
  const url = `${PRE_CONFIG_APIS.LOCATION}`;
  const processed: LocationDTO = _.omit(processSubmittedLocation(data), 'id');
  console.debug(`postLocation with data: ${helpers.inspect(processed)}`);
  const res = await sendPost(url, processed);
  return res?.data;
}

export async function postFloor(data) {
  const url = `${PRE_CONFIG_APIS.FLOOR}`;
  const processed: FloorDTO = _.omit(processSubmittedFloor(data), 'id');
  console.debug(`postFloor with data: ${helpers.inspect(processed)}`);
  const res = await sendPost(url, processed);
  return res?.data;
}

export async function postBuilding(data) {
  console.debug(`postBuilding is called with input: ${helpers.inspect(data)}`);
  
  const url = `${PRE_CONFIG_APIS.BUILDING}`;
  const processed = _.omit(processSubmittedBuilding(data), 'id');
  console.debug(`postBuilding with data: ${helpers.inspect(processed)}`);

  const handler = axios.post(url, processed);
  const [result, resultErr] = await handle(handler);

  if (resultErr) {
    console.error(`sendPost to url ${url} returns error ${resultErr?.message}`);
    throw new Error(getErrorMessageInResponse(resultErr));
  }
  return result?.data;
}

// handle submission for new building, floor, location
export async function postNewBuildingPreconfigWithFloorLocation(
  data,
  customerId
) {
  const { default_wifi_ssid, default_wifi_password } = data;

  const input: BuildingDTO = {
    customers_list_id: customerId,
    building_name: data?.building,
    default_wifi_ssid,
    default_wifi_password,
  };

  const res1 = await postBuilding(input);
  let res2, res3;

  if (data?.floor) {
    const input: FloorDTO = {
      customers_list_id: customerId,
      floor_name: data?.floor,
      customers_building_id: res1?.data?.customers_building_id,
    };
    res2 = await postFloor(input);
    if (data?.location) {
      const input: LocationDTO = {
        customers_list_id: customerId,
        location_name: data?.location,
        customers_floor_id: res2?.data?.customers_floor_id,
      };
      res3 = await postLocation(input);
    }
  }

  return res3 || res2 || res1;
}
