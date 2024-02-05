import { styled } from '@kaidu/shared/lib/styles';
import View from './View';

export const centered = `
  justify-content: center;
  align-items: center;
`;

// Various base layouts
export const RowFlex = styled(View)`
  flex-direction: row;
  max-width: 100%;
  flex-wrap: wrap;
`;

export const MultiItemsRow = styled(RowFlex)`
  justify-content: space-between;
  margin-bottom: 24px;
  /* max-width: 100%; */
`;

export const Centered = styled(View)`
  justify-content: center;
  align-items: center;
`;

export const PaddedContainer = styled(View)`
  padding: 16px;
  flex: 1;
`;

export const FooterContent = styled(Centered)`
  padding-top: 8px;
  width: 100%;
  position: relative;
  background-color: ${props => props.theme.colors.primary};
`;

export const HorizontalSpace = styled(View)`
  width: 80%;
  position: relative;
  margin: auto;
`;

export const VerticalSpace = styled(View)`
  margin-top: 8px;
  margin-bottom: 8px;
`;

