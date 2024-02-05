import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Wifi } from '@kaidu/shared/features/wifi';
import { ScannedDevice } from '~/types/interfaces';
import { AndroidMokoModule, initMokoProModule } from '~/lib/NativeModules';
import { MokoScreenFrame } from '../../../domains/moko/components/organism/MokoScreenFrame';
import { addWifiStorage } from '@kaidu/shared/features/wifi';
import { MokoWifiController } from './MokoWifiController';
import { checkIsMokoMini, checkIsMokoMK110 } from '../../../domains/moko/processors';
import { STACK_SCREENS } from '~/navigation/routes';
import { inspect } from '@kaidu/shared/utils';
import { ScreenWrapper } from '@kaidu/shared/components/headless/ScreenWrapper';

/**
 * set Wifi setting for Moko upgrade
 */
export function MokoWifiScreen(props) {

  // Hooks
  const navigation = useNavigation();

  // Props
  const { route } = props;
  const { device }: { device: ScannedDevice } = route?.params || {};
  console.debug(`MokoWifiScreen device: ${inspect(device)}`);
  const mac = device?.id; // on Android, scanned id is MAC address

  const MokoModule = AndroidMokoModule;

  /**
   * init Moko native Modules to interact with Moko scanners
   */
  useEffect(() => {
    // should init Moko native modules based on model type
    if (Platform.OS === 'android') {
      checkIsMokoMK110(device) && MokoModule.init();
      checkIsMokoMini(device) && initMokoProModule();
      console.debug(`MokoModule initialized`);
    }
  }, []);

  const handleWifiSuccess = async (wifi: Wifi) => {
    //store wifi in async storage

    await addWifiStorage(wifi);
    navigation.navigate({
      name: STACK_SCREENS.MOKO.BLE,
      params: { wifi, device },
      merge: true,
    });
  };

  return (
    <ScreenWrapper>
      <MokoScreenFrame mac={mac} name={device?.name}>
        <MokoWifiController onSuccess={handleWifiSuccess} />
      </MokoScreenFrame>
    </ScreenWrapper>
  );
}

export default MokoWifiScreen;