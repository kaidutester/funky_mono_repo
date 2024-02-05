import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { styled } from '@kaidu/shared/lib/styles';
import Button from '~/components/atomic/Button';
import Text from '~/components/atomic/Text';
import View from '~/components/atomic/View';
import { tailwind } from '@kaidu/shared/lib/styles';
import Icon from '~/components/atomic/Icon';
import { BasicTemplate } from '@kaidu/shared/components/template/BasicTemplate';

const BaseContainer = styled(View)`
  align-items: center;
  width: 100%;
  max-width: 100%;
`;

const Body = styled(BaseContainer)`
  margin-top: 20px;
  /* padding-left: 8%;
  padding-right: 8%; */
  height: auto;
  flex: 8 1;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  background-color: transparent;
`;

export const MtContainer = styled(BaseContainer)`
  margin-top: 20px;
`;

export const MbContainer = styled(BaseContainer)`
  margin-bottom: 30px;
`;

export const StyledBtn = styled(Button)`
  min-width: 100px;
  margin-top: 16px;
`;

export const LongTextContainer = styled(BaseContainer)`
  justify-content: center;
  max-width: 80%;
`;

export const ErrorContainer = styled(BaseContainer)`
  padding: 30px;
  height: 100%;
  justify-content: center;
  max-width: 80%;
`;

export const RootContainer = styled(BaseContainer)`
  flex: 8;
  flex-shrink: 1;
  max-width: 100%;
`;

function MokoDeviceHeader({ mac, name, ...optionals }) {
  const { style, ...rest } = optionals;

  return (
    <>
      <View style={[tailwind('mt-2 flex-row'), style]} {...rest}>
        <Icon name="outlet" color="#444444" size={40} />
        <View style={tailwind('ml-3')}>
          <Text>MAC: {mac}</Text>
          {name ? <Text>Name: {name}</Text> : null}
        </View>
      </View>
    </>
  );
}

export function MokoScreenFrame({ mac, name, ...optionals }) {
  const { heading, children, ...rest } = optionals;

  //Hooks for styling
  // const windowDimensions = useWindowDimensions();
  // const windowWidth = windowDimensions.width;
  // const windowHeight = windowDimensions.height;

  return (
    <BasicTemplate>
      <KeyboardAwareScrollView style={[tailwind('w-full')]}>
        <RootContainer style={[tailwind('p-4 justify-between'), { flex: 1 }]}>
          <MokoDeviceHeader mac={mac} name={name} />
          <Body>{children}</Body>
        </RootContainer>
      </KeyboardAwareScrollView>
    </BasicTemplate>
  );
}
