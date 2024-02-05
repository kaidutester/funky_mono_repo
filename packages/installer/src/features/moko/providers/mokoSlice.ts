import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppState, AppThunk } from '../../../lib/redux/store';
import { createSelector } from 'reselect';
import { MOKO_CONSTANTS } from '~/features/moko/constants';
import _ from 'lodash';
import {
  KAIDU_FIRMWARE_URL,
  MOKO_FIRMWARE_URL,
} from '~/features/firmware';

const { HOST, PORT, SUBPATH } = KAIDU_FIRMWARE_URL || {};

const defaultFirmwareSetting = {
  firmwareHost: HOST,
  firmwarePort: PORT,
  firmwarefilepath: SUBPATH,
};

const initialState = {
  globalConfig: {
    mqttServerHost: MOKO_CONSTANTS.MQTT_HOST,
    mqttServerPort: MOKO_CONSTANTS.MQTT_PORT,
    ...defaultFirmwareSetting,
  },
  updateResult: 'idle',
  currentDeviceMac: '',
};

export const mokoSlice = createSlice({
  name: 'moko',
  initialState,
  reducers: {
    updateMokoGlobalConfig(state, action) {
      const extrasRemoved = _.pick(action.payload, [
        'mqttServerHost',
        'mqttServerPort',
        'firmwareHost',
        'firmwarePort',
        'firmwarefilepath',
      ]);
      state.globalConfig = extrasRemoved;
    },
    updateFirmwareUrl(state, action) {
      state.globalConfig.firmwareHost = action.payload.firmwareHost;
      state.globalConfig.firmwarePort = action.payload.firmwarePort;
      state.globalConfig.firmwarefilepath = action.payload.firmwarefilepath;
    },
    updateFirmwareFilePath(state, action) {
      state.globalConfig.firmwarefilepath = action.payload;
    },
    setUpdateResult(state, action) {
      console.debug(`update result in mokoslice: ${action.payload}`);
      state.updateResult = action.payload;
    },
    setCurrentDeviceMac(state, action) {
      console.debug(`setCurrentDeviceMac: ${action.payload}`);
      state.currentDeviceMac = action.payload;
    },
  },
});

export default mokoSlice.reducer;

export const {
  updateMokoGlobalConfig,
  updateFirmwareUrl,
  updateFirmwareFilePath,
  setUpdateResult,
  setCurrentDeviceMac,
} = mokoSlice.actions;

export const selectMokoGlobalConfig = (state: AppState) =>
  state[mokoSlice.name].globalConfig;
export const selectMokoUpdateResult = (state: AppState) =>
  state[mokoSlice.name].updateResult;
export const selectCurrentDeviceMac = (state: AppState) =>
  state[mokoSlice.name].currentDeviceMac;
export const selectConfirmedMokoUpdateResult = createSelector(
  [selectMokoUpdateResult],
  (updateResult) => {
    return updateResult === 'failed' || updateResult === 'succeed'
      ? updateResult
      : '';
  }
);
