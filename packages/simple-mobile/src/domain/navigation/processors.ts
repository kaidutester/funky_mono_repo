import {CommonActions} from '@react-navigation/native';
import {STACK_SCREENS} from './routes';

export const resetToHome = CommonActions.reset({
  index: 1,
  routes: [{name: STACK_SCREENS.HOME}],
});

export const resetToLogin = CommonActions.reset({
  index: 1,
  routes: [{name: STACK_SCREENS.LOGIN}],
});
