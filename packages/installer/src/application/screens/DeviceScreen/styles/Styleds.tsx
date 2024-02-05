import Text from '../../../../components/atomic/Text';
import { styled } from '@kaidu/shared/lib/styles';
import View from '../../../../components/atomic/View';

export const Wrapper = styled(View)`
  padding: 16px;
  flex-grow: 1;
`;
export const TextLine = styled(Text)`
  margin: 8px 0;
  font-size: 16px;
`;
export const CheckedText = styled(Text)`
  ${({isConsistent, theme}) =>
    isConsistent &&
    `
    color: ${isConsistent ? theme.colors.success : theme.colors.error};
  `}
`;
export const TextWrapper = styled(View)`
  margin-bottom: 16px;
`;
export const HalfLine = styled(View)`
  width: 46%;
`;
