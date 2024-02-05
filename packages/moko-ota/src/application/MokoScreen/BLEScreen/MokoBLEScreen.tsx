import React, { useEffect } from 'react';
import { Wifi } from '@kaidu/shared/features/wifi';
import { activateKeepAwake } from 'expo-keep-awake';
import { ScannedDevice } from '@kaidu/shared/features/ble-general';
import { checkIsMokoMK110, checkIsMokoMini } from '../../../domains/moko/processors';
import { MK110MainContainer } from './MK110MainContainer';
import { MKMiniMainContainer } from './MKMiniMainContainer';
// import { inspect } from '@kaidu/shared/utils';
import { MokoScreenFrame } from '../../../domains/moko/components/organism/MokoScreenFrame';
import { selectTargetDeviceBLEID, selectTargetDevice } from '../../../domains/moko/providers/mokoSlice';
import { useSelector } from 'react-redux';

/**
 * Screen for createing MQTT config data and connect to Moko Scanner. the configuration data will written by the native module
 */
export function MokoBLEScreen(props) {
  //Props
  const { route } = props;
  const { wifi }: { device: ScannedDevice; wifi: Wifi } = route?.params || {};
  const device = useSelector(selectTargetDevice);
  // console.debug(`device: ${inspect(device)}`);
  const name = device?.name || device?.localName;

  useEffect(() => {
    activateKeepAwake();
  }, []);

  return (
    <MokoScreenFrame mac={device?.id} name={name}>
      {checkIsMokoMK110(device) && <MK110MainContainer device={device} wifi={wifi} />}
      {checkIsMokoMini(device) && <MKMiniMainContainer device={device} wifi={wifi} />}
    </MokoScreenFrame>
  );
}
