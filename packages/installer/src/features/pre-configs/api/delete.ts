import {PRE_CONFIG_APIS} from './constants';
import { sendDelete } from '@kaidu/shared/features/axios';
import { getErrorMessageInResponse } from '@kaidu/shared/features/kaidu-server';


export async function deleteLocation(id: string) {
  const url = `${PRE_CONFIG_APIS.LOCATION}/id/${encodeURIComponent(id)}`;
  const res = await sendDelete(url);
  return res;
}

export async function deleteFloor(id: string) {
  const url = `${PRE_CONFIG_APIS.FLOOR}/id/${encodeURIComponent(id)}`;
  const res = await sendDelete(url);
  return res;
}

export async function deleteBuilding(id: string) {
  const url = `${PRE_CONFIG_APIS.BUILDING}/id/${encodeURIComponent(id)}`;
  const res = await sendDelete(url);
  return res;
}
