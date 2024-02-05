import React from 'react';
import { Text } from '@kaidu/shared/components/atomic/Text';
import { AsyncLifecycle } from '@kaidu/shared/types';
import { View } from '@kaidu/shared/components/atomic/View';
import { ModalTitle } from '@kaidu/shared/components/atomic/Heading';
import { Button } from '@kaidu/shared/components/atomic/Button';
import Overlay from '@kaidu/shared/components/atomic/Overlay';
import { tailwind } from '@kaidu/shared/lib/styles';
import Image from '@kaidu/shared/components//atomic/Image';
import { useTheme } from '@kaidu/shared/lib/styles'
// import { Icon } from '@kaidu/shared/components/atomic/Icon';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectOperationResult,
  updateOperationResultState,
} from '@kaidu/shared/lib/redux/globalStatusSlice';
import { ErrorMsg } from '@kaidu/shared/components/organism/ErrorMsg';

function SuccessView({ onConfirm, ...optionals }) {
  const { name, ...rest } = optionals;
  const theme = useTheme();
  const displayedName = name ? name + ' ' : '';

  const text = `The scanner ${displayedName}has received firmware update command successfully! It will reboot in a few seconds. The LED light will flash green and blue during the firmware update`;

  return (
    <>
      <View style={tailwind('items-center')}>
        <Image
          source={require('@kaidu/shared/assets/dimond.png')}
          style={tailwind('rounded-lg')}
        />
        <ModalTitle>Success!</ModalTitle>
        <Text
          style={[{ color: theme?.colors?.tertiary }, tailwind('leading-6')]}
        >
          {text}
        </Text>
      </View>
      <View style={tailwind('items-center')}>
        <Button title={'Confirm'} onPress={onConfirm} type='success' />
      </View>
    </>
  );
}

const error = new Error(`Failed to write firmware update command`);
const showButtons = {
  retry: false,
  cancel: false,
  confirm: true,
};

/**
 * show result for configuration operations
 */
export function ResultOverlay(props) {
  // Global state
  const dispatch = useDispatch();
  const operationResult = useSelector(selectOperationResult);
  // const { state, type, device } = operationResult || {};
  // const { bleID } = device || {};
  // console.debug('ResultOverlay state', state);

  const handleConfirm = () => {
    // dispatch(updateOperationResultState(AsyncLifecycle.IDLE));
  };

  return (
    <Overlay isVisible={state === AsyncLifecycle.FULFILLED}>
      <View
        style={tailwind(
          'p-4 py-10 h-4/5 justify-between rounded-lg flex-grow my-12'
        )}
      >
        {state === AsyncLifecycle.FULFILLED ? (
          <SuccessView onConfirm={handleConfirm} />
        ) : null}
        {state === AsyncLifecycle.REJECTED ? (
          <ErrorMsg
            bleId={bleID}
            error={error}
            showButtons={showButtons}
            onConfirm={handleConfirm}
          />
        ) : null}
      </View>
    </Overlay>
  );
}
