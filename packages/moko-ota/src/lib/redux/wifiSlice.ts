import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {AppState, AppThunk} from './store';
import {createSelector} from 'reselect';
import _ from 'lodash';

export type Wifi = {
  ssid: string;
  password: string;
};

const initialState: Wifi & {[x: string]: any} = {
  ssid: '',
  password: '',
};

export const wifiSlice = createSlice({
  name: 'WiFi',
  initialState,
  reducers: {
    updateGlobalWiFi(state, action: PayloadAction<Wifi>) {
      if (action.payload.ssid) {
        state.ssid = action.payload.ssid;
      }
      if (action.payload.password) {
        state.password = action.payload.password;
      }
    },
  },
});

export default wifiSlice.reducer;

export const {updateGlobalWiFi, } =
  wifiSlice.actions;

export const selectWiFi = (state: AppState) => {
  return {
    ssid: state[wifiSlice.name].ssid,
    password: state[wifiSlice.name].password,
  };
};
export const selectWiFiSSID = (state: AppState): string =>
  state[wifiSlice.name].ssid;
export const selecthasWiFiSsid = createSelector(
  selectWiFiSSID,
  (wifiSsid: string) => {
    return Boolean(wifiSsid);
  },
);
export const selectWiFiPassword = (state: AppState): string =>
  state[wifiSlice.name].password;

