/*
  Global state related to BLE devices
*/
import { DeviceStatistics } from '~/types/interfaces';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  ScannedDevice,
  Filter,
  ConfigurationInServer,
  ScannedDeviceCategory,
} from '../../types/interfaces';
import type { AppState, AppThunk } from './store';
import { cancelConnection } from '~/lib/ble-general/ble-manager';
import _ from 'lodash';
import produce from 'immer';
import { inspect } from '@kaidu/shared/utils';

const initialState = {
  scannedDevices: {},
  scannedIdsAndCategory: {},
  scanFilter: {
    onlyKaidu: true,
    onlyMoko: false,
  },
  connectingDeviceId: '',
  connectedDeviceId: '',
  deviceServerConfig: {
    device_name: null,
    wifi_ssid: null,
    wifi_password: null,
    mqtt_device_id: null,
    mqtt_device_certificate: null,
    mac_address: null,
    customer_name: null,
    building: null,
    location: null,
  } as ConfigurationInServer,
  deviceStatistics: {
    ble_scan_counter: 0,
    mqtt_upload_counter: 0,
    reboot_counter: 0,
    beacon_status: null,
    source_id: null,
    start_time: null,
    end_time: null,
  } as DeviceStatistics,
  mokoDeviceCounter: Math.floor(Math.random() * 100000), // a counter for generating moko device id
  // customizedFirmwareUrl: '',
  scannedMoko: null as ScannedDevice | null,
};

export const disconnectConnectedDeviceThunk: any = createAsyncThunk(
  'device/disconnect',
  async (deviceId: string, thunkAPI: any) => {
    const { device } = thunkAPI.getState();
    // console.debug(`State keys: ${Object.keys(device)}`);
    console.debug(`connected id: ${device.connectedDeviceId}`);
    console.debug(`input BLE device id: ${deviceId}`);
    if (deviceId) {
      const result = await cancelConnection(deviceId);
    }

    if (device?.connectedDeviceId) {
      const result = await cancelConnection(device.connectedDeviceId);
    }

    return true;
  }
);

export const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    updateScannedDevices(state, action: PayloadAction<ScannedDevice>) {
      // check if the scanned device should be put into the scanned device list

      const categorizedDevice = action.payload;
      // console.debug(`Scanned Device: ${inspect(categorizedDevice)}`);
      const deviceCategory = categorizedDevice.category;

      if (categorizedDevice.category === ScannedDeviceCategory.MOKO) {
        state.scannedMoko = categorizedDevice;
      } else if (
        typeof categorizedDevice.category === 'undefined' ||
        categorizedDevice.category === ScannedDeviceCategory.UNKNOWN
      ) {
        return;
      }

      // if onlyKaidu is checked and it's not Kaidu
      if (
        state.scanFilter.onlyKaidu &&
        deviceCategory !== ScannedDeviceCategory.KAIDU
      ) {
        return;
      }

      if (
        state.scanFilter.onlyMoko &&
        deviceCategory !== ScannedDeviceCategory.MOKO
      ) {
        return;
      }

      // console.debug(
      //   `Device: ${categorizedDevice.id}, RSSI: ${categorizedDevice.rssi}`
      // );

      //always add a displayName property
      categorizedDevice.displayName = categorizedDevice.name ?? 'N/A';

      const existingDevice = {
        ...state.scannedDevices[categorizedDevice.id],
      };
      //update scanned devices
      const baseState = state.scannedDevices;
      const nextScannedDevices = produce(baseState, (draftState) => {
        draftState[categorizedDevice.id] = categorizedDevice;
      });
      state.scannedDevices = nextScannedDevices;

      // overwrite scannedIdsAndCategory if category changes, otherwise do not change it
      if (
        _.isEmpty(existingDevice) ||
        categorizedDevice.category !== existingDevice.category
      ) {
        const scannedIC = _.pick(categorizedDevice, ['id', 'category']);
        const baseState = state.scannedIdsAndCategory;
        const nextScannedIdsAndCategory = produce(baseState, (draftState) => {
          draftState[scannedIC.id] = scannedIC;
        });
        state.scannedIdsAndCategory = nextScannedIdsAndCategory;
      }
    },
    cleanUpScannedDevices(state) {
      state.scannedDevices = initialState.scannedDevices;
      state.scannedIdsAndCategory = initialState.scannedIdsAndCategory;
    },
    updateConnectedDeviceId(state, action: PayloadAction<string>) {
      state.connectedDeviceId = action.payload;
    },
    updateConnectingDeviceId(state, action: PayloadAction<string>) {
      state.connectingDeviceId = action.payload;
    },
    updateFilter(state, action: PayloadAction<Filter>) {
      state.scanFilter = action.payload;
    },
    updateDeviceServerConfig(
      state,
      action: PayloadAction<ConfigurationInServer>
    ) {
      // Add scanner configuration data in Kaidu config server to the scanned device
      state.deviceServerConfig = action.payload;
      if (action.payload.device_name && action.payload.mac_address) {
        const device = state.scannedDevices[action.payload.mac_address];
        if (device) {
          device.displayName = `${device.name}/${action.payload.device_name}`;
        }
      }
    },
    updateDeviceStatistics(
      state,
      action: PayloadAction<DeviceStatistics | null>
    ) {
      if (action.payload === null) {
        return;
      }
      state.deviceStatistics = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(
      disconnectConnectedDeviceThunk.fulfilled,
      (state, action) => {
        state.connectedDeviceId = '';
      }
    );
  },
});

export default deviceSlice.reducer;

export const {
  updateScannedDevices,
  cleanUpScannedDevices,
  updateConnectedDeviceId,
  updateConnectingDeviceId,
  updateFilter,
  updateDeviceServerConfig,
  updateDeviceStatistics,
} = deviceSlice.actions;

export const selectScannedDevices = (state: AppState) =>
  Object.values(state[deviceSlice.name].scannedDevices);
export const selectSortedScannedDevices = (state: AppState): any[] => {
  const keys = Object.keys(state[deviceSlice.name].scannedDevices);
  const allDevices = state[deviceSlice.name].scannedDevices;
  return keys
    .map((key) => allDevices[key])
    .sort((a, b) => (b?.rssi > a?.rssi ? 1 : -1));
};
export const selectScannedDevice = (
  state: AppState,
  mac: string
): ScannedDevice | undefined => {
  console.debug(`scannedDevices in global state: ${inspect(state[deviceSlice.name].scannedDevices)}`);
  return state[deviceSlice.name].scannedDevices[mac];
};
export const selectScannedDeviceIdsAndCategory = (state: AppState) =>
  Object.values(state[deviceSlice.name].scannedIdsAndCategory);
export const selectConnectedDeviceId = (state: AppState) =>
  state[deviceSlice.name].connectedDeviceId;
export const selectConnectingDeviceId = (state: AppState) =>
  state[deviceSlice.name].connectingDeviceId;
// export const selectDeviceServerConfig = (state: AppState) =>
//   state[deviceSlice.name].deviceServerConfig;
export const selectDeviceNameInServer = (state: AppState) =>
  state[deviceSlice.name].deviceServerConfig.device_name;
export const selectFilter = (state: AppState) =>
  state[deviceSlice.name].scanFilter;
export const selectHasDevice = (state: AppState) =>
  !_.isEmpty(state[deviceSlice.name].scannedIdsAndCategory);
export const selectDeviceStatistics = (state: AppState): DeviceStatistics =>
  state[deviceSlice.name].deviceStatistics;
export const selectScannedMoko = (state: AppState): ScannedDevice =>
  state[deviceSlice.name].scannedMoko;
