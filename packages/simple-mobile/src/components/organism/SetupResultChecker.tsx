import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { clearSetup, selectSetup } from '@kaidu/shared/lib/redux/setupSlice';
import { updateScannedDeviceState, cleanUpScannedDevices } from '@kaidu/shared/providers/ble-devices';
import { SetupResult } from '@kaidu/shared/components/organism/SetupResult';
import { cancelConnection } from '@kaidu/shared/features/ble-general';
import { useNavigation } from '@react-navigation/native';
import { STACK_SCREENS } from '@kaidu/simple/src/domain/navigation/routes';
//import { delay } from 'lodash';
import { sleep } from '@kaidu/shared/utils';

/**
 * check setup results and display dialogs
 * XXXDC- not used anymore
 */
export function SetupResultChecker() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { name, state, bleId, plugState } = useSelector(selectSetup);
  console.debug(`SetupResultChecker got state: ${state}`);

  /**
   * disconnect BLE and reset related global states
   */
  const handleFinish = async () => {
    console.log('file: SetupResultChecker.tsx ~ line 26 ~ handleFinish ~ bleId', bleId); //XXXDC added log
    
    try {
      await cancelConnection(bleId);
      //await sleep(5000); //XXXDC added delay to allow time for disconnect to complete
      //delay(() => console.log('file: SetupResultChecker.tsx ~ line 33 ~ handleFinish ~ bleId', bleId), 2000);
    } catch (error) {
      console.debug(`SetupResultChecker: Error cancelling connection: ${error}`);
    }
    dispatch(clearSetup());
    dispatch(updateScannedDeviceState({id: bleId, plugState}));
    dispatch(cleanUpScannedDevices()); //XXXDC added to clear scanned devices list
    
    // navigate to Home screen
    navigation.navigate(STACK_SCREENS.HOME);
  }

  return (
    <SetupResult result={{ state, name, plugState }} onFinish={handleFinish} />
  )
}
