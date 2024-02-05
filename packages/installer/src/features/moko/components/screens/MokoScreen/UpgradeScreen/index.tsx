import { MK110MainContainer } from './MK110MainContainer';
import { MKMiniMainContainer } from './MKMiniMainContainer';
import React from 'react';
import { ScannedDevice } from '@kaidu/shared/features/ble-general/types';
import { useKaiduFirmwareList } from '@kaidu/shared/features/kaidu-server';
import { checkIsMokoMK110, checkIsMokoMini } from '../../../../processors';
import { MokoScreenFrame } from '../../../organism/MokoScreenFrame';
import { cond, always, T } from 'ramda';
import { MokoDeviceTypeEnum, getMokoPlugModelType } from '~/features/moko';
import ActivityIndicator from '@kaidu/shared/components/atomic/ActivityIndicator';

/**
 * 
 */
export default function MokoUpgradeScreen(props) {
  // Hooks
  const {latest, isLoading} = useKaiduFirmwareList();

  //Props
  const { route } = props;
  const { device }: { device: ScannedDevice } = route?.params;
  const mac = device?.id;
  const name = device?.name || device?.localName;

  const deviceType: MokoDeviceTypeEnum = getMokoPlugModelType(device);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  // render by model type
  const render = cond(
    [
      [checkIsMokoMK110, always(<MK110MainContainer mac={mac} device={device} />)],
      [checkIsMokoMini, always(<MKMiniMainContainer mac={mac} deviceType={deviceType} />)],
      [T, always(null)],
    ]
  );

  return (
    <MokoScreenFrame mac={mac} name={name}>
      {render(device)}
    </MokoScreenFrame>
  );
}
