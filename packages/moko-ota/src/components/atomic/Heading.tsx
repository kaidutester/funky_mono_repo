import Text, {BASE_SIZE} from './Text';
import { styled } from '@kaidu/shared/lib/styles';

export const BaseHeading = styled(Text)`
  text-align: center;
  color: ${props => props.theme.colors.fourth};
`;

export const Heading = styled(Text)`
  text-align: center;
  color: ${props => props.theme.colors.fourth};
  font-size: ${BASE_SIZE * 1.6}px;
`;

export const H2 = styled(BaseHeading)`
  font-size: ${BASE_SIZE * 1.3}px;
  margin-bottom: 16px;
`;
