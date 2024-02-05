import React from 'react';
import View from '~/components/atomic/View';
import Text from '~/components/atomic/Text';
import { styled } from '@kaidu/shared/lib/styles';

const StyledText = styled(Text)`
  color: ${props => props.theme.colors.error};
`;

const StyledView = styled(View)`
  height: auto;
  width: 100%;
`;

export function ErrorText(props) {
  const {children, ...rest} = props;

  return (
    <StyledView {...rest}>
      <StyledText>{children}</StyledText>
    </StyledView>
  );
}
