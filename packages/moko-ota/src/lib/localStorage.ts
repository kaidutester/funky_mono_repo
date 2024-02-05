import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';
import {AUTH_STORAGE_KEY, ACCESS_TOKEN_KEY} from '~/features/authentication'

export const STORAGE_KEYS = {
  AUTH: AUTH_STORAGE_KEY,
  AUTH_TOKEN: ACCESS_TOKEN_KEY,
  WIFI_HISTORY: '@wifis',
};

export async function clearAll() {
  await AsyncStorage.clear();
}

export async function removeItem(key) {
  return await AsyncStorage.removeItem(key);
}

export async function getItem(key: string) {
  return await AsyncStorage.getItem(key);
}

// return parsed object from async storage, return null if it doesn't exist
export async function asyncStorageFetcher(key: string): Promise<any> {
  const fetched = await getItem(key);
  let parsed;
  if (fetched) {
    parsed = JSON.parse(fetched);
  }
  return parsed || null;
}