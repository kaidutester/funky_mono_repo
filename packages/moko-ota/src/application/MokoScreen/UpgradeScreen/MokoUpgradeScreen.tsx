import { MK110MainContainer } from './MK110MainContainer';
import { MKMiniMainContainer } from './MKMiniMainContainer';
import React from 'react';
import { ScannedDevice } from '@kaidu/shared/features/ble-general/types';
import {
  checkIsMokoMK110,
  checkIsMokoMini,
} from '../../../domains/moko/processors';
import { MokoScreenFrame } from '../../../domains/moko/components/organism/MokoScreenFrame';
import { cond, always, T } from 'ramda';
import { MokoDeviceTypeEnum, getMokoPlugModelType } from '~/domains/moko';
import { mokoUpdateStateMachine } from '../../../domains/moko';
import { useMachine, useInterpret } from '@xstate/react';

/**
 * Execute the firmware update
 */
export function MokoUpgradeScreen(props) {
  //Props
  const { route } = props;
  const { device }: { device: ScannedDevice } = route?.params;
  const { displayName, id: mac } = device || {};
  const deviceType: MokoDeviceTypeEnum = getMokoPlugModelType(device);

  const [mokoUpdateState, send] = useMachine(mokoUpdateStateMachine);
  const mokoUpdateService = useInterpret(mokoUpdateStateMachine);

  const handleResetStateMachine = () => {
    mokoUpdateService.stop();
    mokoUpdateService.start();
  };

  // render by model type
  const render = cond([
    [
      checkIsMokoMK110,
      always(
        <MK110MainContainer
          mac={mac}
          deviceName={displayName}
          send={send}
          mokoUpdateState={mokoUpdateState}
          onReset={handleResetStateMachine}
        />
      ),
    ],
    [
      checkIsMokoMini,
      always(<MKMiniMainContainer mac={mac} deviceType={deviceType} />),
    ],
    [T, always(null)],
  ]);

  return (
    <MokoScreenFrame mac={mac} name={displayName}>
      {render(device)}
    </MokoScreenFrame>
  );
}
