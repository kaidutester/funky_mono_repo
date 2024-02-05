import React, { useEffect } from 'react';
import Text from '~/components/atomic/Text';
import { LongTextContainer } from '../../../domains/moko/components/organism/MokoScreenFrame';
import { tailwind } from '@kaidu/shared/lib/styles';
import { Button } from '@kaidu/shared/components/atomic/Button';


/**
 * connect via BLE, saved MQTT config will be set automatically when it's connected
 */
export function MokoBleController({  bleID, send, ble, context, ...optionals }) {
  // Props
  const { onError, onSuccess, ...rest } = optionals;
  const {errorMsg, msg} = context || {};

  // Local states

  useEffect(() => {
    send({ type: 'START_BLE_CONNECT', data: bleID });
  }, []);

  const isError = ble === 'error';
  

  return (
    <LongTextContainer>
      {/* <Text>{displayedMsg}</Text> */}
      {isError ? (
        <Text style={tailwind('text-red-500')}>{errorMsg}</Text>
      ) : (
        <>
          <Text>State: {ble}</Text>
          <Text>Message: {msg}</Text>
        </>
      )}
      {isError ? (
        <Button
          onPress={() => {
            send({ type: 'START_BLE_CONNECT', data: bleID })}}
          title={'Retry'}
        ></Button>
      ) : null}
    </LongTextContainer>
  );
}
