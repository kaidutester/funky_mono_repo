import {configureStore, ThunkAction} from '@reduxjs/toolkit';
import {Action, combineReducers, Reducer} from 'redux';
import thunk from 'redux-thunk';

//self-defined dependencies
import globalStatusReducer, {
  globalStatusSlice,
} from '@kaidu/shared/lib/redux/globalStatusSlice';
import deviceReducer, {
  deviceSlice,
} from '@kaidu/shared/providers/ble-devices/deviceSlice';
import wifiSliceReducer, {wifiSlice} from '@kaidu/shared/lib/redux/wifiSlice';
import setupReducer, {setupSlice} from '@kaidu/shared/lib/redux/setupSlice';
import lteReducer, {lteSlice} from '@kaidu/shared/lib/redux/lteSlice';

const baseReducers: Reducer = combineReducers({
  //all reducers should be put here
  [globalStatusSlice.name]: globalStatusReducer,
  [deviceSlice.name]: deviceReducer,
  [wifiSlice.name]: wifiSliceReducer,
  [setupSlice.name]: setupReducer,
  [lteSlice.name]: lteReducer,
});

const reducers = baseReducers;

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
