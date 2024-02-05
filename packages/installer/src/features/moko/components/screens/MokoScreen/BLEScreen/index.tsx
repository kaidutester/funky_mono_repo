import React, { useEffect } from 'react';
import { Wifi } from '@kaidu/shared/features/wifi';
import { activateKeepAwake } from 'expo-keep-awake';
import { ScannedDevice } from '@kaidu/shared/features/ble-general';
import { checkIsMokoMK110, checkIsMokoMini } from '../../../../processors';
import { MK110MainContainer } from './MK110MainContainer';
import { MKMiniMainContainer } from './MKMiniMainContainer';
import { inspect } from '@kaidu/shared/utils';
import { MokoScreenFrame } from '../../../organism/MokoScreenFrame';

/**
 * Screen for createing MQTT config data and connect to Moko Scanner. the configuration data will written by the native module
 */
export default function MokoBLEScreen(props) {
  //Props
  const { route } = props;
  const { device, wifi }: { device: ScannedDevice; wifi: Wifi } = route?.params || {};
  console.debug(`device: ${inspect(device)}`);
  const name = device?.name || device?.localName;

  useEffect(() => {
    activateKeepAwake();
  }, []);


  // useEffect(() => {
  //   console.debug('wifi', wifi);
  //   throw new Error('password is not defined');
  // }, [wifi]);

  return (
    <MokoScreenFrame mac={device?.id} name={name}>
      {checkIsMokoMK110(device) && <MK110MainContainer device={device} wifi={wifi} />}
      {checkIsMokoMini(device) && <MKMiniMainContainer device={device} wifi={wifi} />}
    </MokoScreenFrame>
  );
}
