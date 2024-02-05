import React from 'react';
import {Overlay} from 'react-native-elements';
import {withTheme, useTheme} from 'styled-components/native';

export function BaseOverlay({isVisible, ...optionals}) {
  const {children, ...rest} = optionals;
  const theme = useTheme();

  return (
    <Overlay
      isVisible={isVisible}
      overlayStyle={{
        backgroundColor: 'transparent',
        borderWidth: 0,
        shadowColor: 'transparent',
        elevation: 0,
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      backdropStyle={{backgroundColor: theme.colors.grayscale[3], opacity: 0.9}}
      {...rest}>
      {children}
    </Overlay>
  );
}


function MyOverlay({isVisible, theme, ...optionals}) {
  const {children, ...rest} = optionals;
  return (
    <Overlay
      isVisible={isVisible}
      overlayStyle={{
        backgroundColor: 'transparent',
        borderWidth: 0,
        shadowColor: 'transparent',
        elevation: 0,
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      backdropStyle={{backgroundColor: theme.colors.grayscale[3], opacity: 0.9}}
      {...rest}>
      {children}
    </Overlay>
  );
}

export default withTheme(MyOverlay);
