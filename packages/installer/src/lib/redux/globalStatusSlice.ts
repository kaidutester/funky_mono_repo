import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GlobalStatus, Status } from '../../types/interfaces';
import type { AppState, AppThunk } from './store';
import _ from 'lodash';
import { AsyncLifecycle } from '@kaidu/shared/types';

const initialState: GlobalStatus = {
  status: 'idle',
  isScanning: false,
  isConnecting: false,
  isUpdating: false,
  onSetup: '',
  operationResult: {
    type: '',
    state: AsyncLifecycle.IDLE,
  },
};

export const globalStatusSlice = createSlice({
  name: 'globalStatus',
  initialState,
  reducers: {
    updateIsScanning(state, action: PayloadAction<boolean>) {
      state.isScanning = action.payload;
    },
    setUpdating(state, action: PayloadAction<boolean>) {
      state.isUpdating = action.payload;
    },
    updateSetupState(state, action: PayloadAction<string>) {
      state.onSetup = action.payload;
    },
    updateOperationResult(state, action: PayloadAction<object>) {
      state.operationResult = action.payload;
    },
    updateOperationResultState(state, action: PayloadAction<AsyncLifecycle>) {
      state.operationResult.state = action.payload;
    }
  },
});

export default globalStatusSlice.reducer;

export const {
  updateIsScanning,
  setUpdating,
  updateSetupState,
  updateOperationResult,
  updateOperationResultState
} = globalStatusSlice.actions;

export const selectIsScanning = (state: AppState) =>
  state[globalStatusSlice.name].isScanning;
export const selectIsUpdating = (state: AppState) =>
  state[globalStatusSlice.name].isUpdating;
export const selectUpdatingMsg = (state: AppState): string =>
  state[globalStatusSlice.name].updatingMsg;
// if there is a user email in login info, return true
export const selectSetupState = (state: AppState) =>
  state[globalStatusSlice.name].onSetup;
export const selectOperationResult = (state: AppState) =>
  state[globalStatusSlice.name].operationResult;
