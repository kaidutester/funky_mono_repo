import React from 'react';
import Icon from '~/components/atomic/Icon';
import { withTheme } from '@kaidu/shared/lib/styles';

function MyBLEIcon(props) {
  return (
    <Icon
      name="bluetooth-connect"
      type="material-community"
      color={props.isConnected ? props.theme.colors.blue : props.theme.colors.grayscale[4]} />
  );
}

export default withTheme(MyBLEIcon);