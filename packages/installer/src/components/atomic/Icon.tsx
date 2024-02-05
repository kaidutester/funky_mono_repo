// Icon names reference: https://oblador.github.io/react-native-vector-icons/
// https://github.com/oblador/react-native-vector-icons
import React from 'react';
import {Icon} from 'react-native-elements';
import { styled } from '@kaidu/shared/lib/styles';
import { withTheme } from '@kaidu/shared/lib/styles';


const StyledIcon = styled(Icon)`
`;

function MyIcon({theme, ...rest}) {
  return <StyledIcon color={theme.colors.tertiary} {...rest} />;
}

export default withTheme(MyIcon);