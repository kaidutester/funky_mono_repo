import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppState, AppThunk } from '../../../../lib/redux/store';
import { createSelector } from 'reselect';

const initialState = {
  preConfigs: {
    buildings: [] as string[],
    floors: [] as string[],
    locations: [] as string[],
  },
  modal: {
    isModalOpened: false,
    data: {} as any,
  },
};

export const preconfigSlice = createSlice({
  name: 'preconfig',
  initialState,
  reducers: {
    updatePreConfig(state, action) {
      state.preConfigs = action.payload;
    },
    updateBuildings(state, action) {
      state.preConfigs.buildings = action.payload;
    },
    updateFloors(state, action) {
      state.preConfigs.buildings = action.payload;
    },
    updateLocations(state, action) {
      state.preConfigs.buildings = action.payload;
    },
    toggleModal(state) {
      const isOpen = state.modal.isModalOpened;
      state.modal.isModalOpened = !isOpen;
    },
    setOpenModal(state, action) {
      state.modal.isModalOpened = action.payload;
    },
    setModalData(state, action) {
      state.modal.data = action.payload;
    },
    clearModalData(state) {
      state.modal.data = initialState.modal.data;
    }
  },
});

export default preconfigSlice.reducer;

export const {
  updatePreConfig,
  updateBuildings,
  updateFloors,
  updateLocations,
  toggleModal,
  setOpenModal,
  setModalData,
  clearModalData,
} = preconfigSlice.actions;

export const selectPreConfigs = (state: AppState) =>
  state[preconfigSlice.name].preConfigs;
export const selectBuildings = (state: AppState) =>
  state[preconfigSlice.name].preConfigs.buildings;
export const selectFloors = (state: AppState) =>
  state[preconfigSlice.name].preConfigs.floors;
export const selectLocations = (state: AppState) =>
  state[preconfigSlice.name].preConfigs.locations;
export const selectModal = (state: AppState) =>
  state[preconfigSlice.name].modal;
export const selectModalData = (state: AppState) =>
  state[preconfigSlice.name].modal.data;
export const selectIsToastOpen = (state: AppState) =>
  state[preconfigSlice.name].modal.toast.isOpen;
export const selectToastContent = (state: AppState) =>
  state[preconfigSlice.name].modal.toast.content;
  export const selectIsModalOpen = (state: AppState) =>
  state[preconfigSlice.name].modal.isModalOpened;