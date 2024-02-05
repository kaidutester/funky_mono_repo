import React from 'react';
// import {Overlay} from 'react-native-elements';
import PropTypes from 'prop-types';
// import Button from '../atomic/Button';
import Text from './Text';
import { styled } from '@kaidu/shared/lib/styles';
import {RowFlex} from './Layouts';
import Overlay from './Overlay';
import { tailwind } from '@kaidu/shared/lib/styles';
import Button from './Button';
import {scale, verticalScale} from 'react-native-size-matters';

const StyledOverlay = styled(Overlay).attrs(props => ({
  overlayStyle: {
    minWidth: '80%',
    backgroundColor: props.theme.colors.primary,
  },
}))`
  background-color: ${props => props.theme.colors.primary};
`;

const PopupBtn = styled(Button)`
  align-self: flex-start;
  background-color: ${props => props.theme.colors.fifth};
  margin-left: 12px;
`;

const PopupRowFlex = styled(RowFlex)`
  margin-top: 16px;
  justify-content: flex-end;
  align-items: center;
`;

function Popup({visible, onConfirm, text, onCancel, ...optionals}) {
  const {
    confirmText = 'Confirm',
    showCancel = false,
    showConfirm = true,
    showButtons = true,
    children,
    confirmAccessibilityLabel,
    ...rest
  } = optionals;

  return (
    <StyledOverlay
      isVisible={visible}
      onBackdropPress={onCancel ?? onConfirm}
      {...rest}>
      {text ? (
        <Text style={{marginBottom: verticalScale(8)}}>{text}</Text>
      ) : null}
      {children ? children : null}
      {showButtons ? (
        <PopupRowFlex>
          {showConfirm ? (
            <PopupBtn
              title={confirmText}
              onPress={onConfirm}
              accessibilityLabel={confirmAccessibilityLabel}
            />
          ) : null}
          {showCancel ? <PopupBtn title="Cancel" onPress={onCancel} /> : null}
        </PopupRowFlex>
      ) : null}
    </StyledOverlay>
  );
}

Popup.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func, //if it is nullish, it will be replaced by onConfirm
  showCancel: PropTypes.bool,
  text: PropTypes.string,
};

export default Popup;
