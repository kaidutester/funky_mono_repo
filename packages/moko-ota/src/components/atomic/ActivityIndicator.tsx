import React from 'react';
import Text from './Text';
import Overlay from './Overlay';
import * as Progress from 'react-native-progress';
import { styled } from '@kaidu/shared/lib/styles';

const StyledText = styled(Text)`
  color: ${props => props.theme.colors.primary};
`;

export function BaseActivityIndicator(props) {
  const {animating = true, text, isVisible = true, children, ...rest} = props;
  return (
    <Overlay isVisible={isVisible} transparent={true} {...rest}>
      <Progress.Circle size={50} borderWidth={5} indeterminate={true} />
      {text ? <StyledText>{text}</StyledText> : null}
      {children ? children : null}
    </Overlay>
  );
}

export default BaseActivityIndicator
