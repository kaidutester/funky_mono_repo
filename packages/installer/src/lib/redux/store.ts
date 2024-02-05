import { configureStore, ThunkAction } from '@reduxjs/toolkit';
import { Action, combineReducers, Reducer } from 'redux';
import thunk from 'redux-thunk';
// import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

//self-defined dependencies
import mokoSliceReducer, {
  mokoSlice,
} from '../../features/moko/providers/mokoSlice';
import wifiSliceReducer, { wifiSlice } from './wifiSlice';
import setupReducer, { setupSlice } from '@kaidu/shared/lib/redux/setupSlice';
import deviceReducer, {
  deviceSlice,
} from '@kaidu/shared/providers/ble-devices/deviceSlice';
import globalStatusReducer, {
  globalStatusSlice,
} from '@kaidu/shared/lib/redux/globalStatusSlice';

// const persistConfig = {
//   key: 'root',
//   storage: AsyncStorage,
//   stateReconciler: hardSet,
//   // blacklist: ['device/scannedDevices', 'globalStatus'],
//   whitelist: ['globalStatus/appClientId'],
//   // manualPersist: true,
// };

const baseReducers: Reducer = combineReducers({
  //all reducers should be put here
  [globalStatusSlice.name]: globalStatusReducer,
  [deviceSlice.name]: deviceReducer,
  [mokoSlice.name]: mokoSliceReducer,
  [wifiSlice.name]: wifiSliceReducer,
  [setupSlice.name]: setupReducer,
});

let persistedReducer;
// persistedReducer = persistReducer(persistConfig, baseReducers);

const reducers = persistedReducer ?? baseReducers;

const makeStore = () =>
  configureStore({
    reducer: reducers,
    devTools: true,
    middleware: [thunk],
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore['getState']>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>;

// export an assembled wrapper
const store = makeStore();
export default store;
