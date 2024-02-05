import { styled } from '@kaidu/shared/lib/styles';
import Button from '../../atomic/Button';
import Input from '../../atomic/Input';
import ScrollView from '../../atomic/ScrollView';

export const FormInput = styled(Input).attrs(props => ({
  inputContainerStyle: {
    borderBottomWidth: 0,
    backgroundColor: props.theme.colors.secondary,
  },
  inputStyle: {
    color: props.theme.colors.tertiary,
  },
}))``;

export const SubmitBtn = styled(Button)`
  width: 80%;
`;

export const FormContainer = styled(ScrollView)`
  max-height: 100%;
  padding-left: 24px;
  padding-right: 24px;
  margin-bottom: 64px;
`;
