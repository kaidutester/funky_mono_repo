import { User } from '@kaidu/shared/features/kaidu-server';
import { STACK_SCREENS } from '@kaidu/simple/src/domain/navigation/routes';
import { checkHasMultiAvailableCustomer } from '@kaidu/shared/domain/user';

/**
 * return the Home screen or Customer Select screen
 */
export function getTargetRouteAfterLogin(userItem: User): string {
  const isMultiCustomer = checkHasMultiAvailableCustomer(userItem);
  return isMultiCustomer ? STACK_SCREENS.CUSTOMER : STACK_SCREENS.HOME;
}