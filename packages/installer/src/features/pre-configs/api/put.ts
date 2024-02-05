import axios from 'axios';
import { PRE_CONFIG_APIS } from './constants';
import { handle, inspect } from '@kaidu/shared/utils';
import { getErrorMessageInResponse } from '@kaidu/shared/features/kaidu-server';
import {processSubmittedBuilding, processSubmittedFloor, processSubmittedLocation, processSubmittedFloorPlan} from '../lib';

export async function sendPut(url, data) {
  const [result, resultErr] = await handle(axios.put(url, data));

  if (resultErr) {
    console.error(resultErr);
    throw new Error(getErrorMessageInResponse(resultErr));
  }
  return result;
}

export async function putLocation(data) {
  const input = processSubmittedLocation(data);
  const url = PRE_CONFIG_APIS.LOCATION;
  const res = await sendPut(url, input);
  return res;
}

export async function putFloor(data) {
  console.debug(`putFloor receive input ${inspect(data)}`);
  const input = processSubmittedFloor(data);
  const url = PRE_CONFIG_APIS.FLOOR;
  console.debug(`putFloor send request with ${inspect(input)}`);
  const res = await sendPut(url, input);
  return res;
}

export async function putBuilding(data) {
  const input = processSubmittedBuilding(data);
  const url = PRE_CONFIG_APIS.BUILDING;
  const res = await sendPut(url, input);
  return res;
}