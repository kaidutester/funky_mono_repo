import * as app from '../app.json';
import { version } from '../../package.json';

//App globals
export const NAME = app?.name;
/**
 * APP display name
 */
export const DISPLAY_NAME = app?.displayName;
export const VERSION = version;

// Credentials
export const webClientId =
  '229716020794-d8jtegfbk2m7bajemqe2gg36if8c44fa.apps.googleusercontent.com';
export const iosClientId =
  '229716020794-dofa5o7q2nc6q43v1r27cr6u7mhe26ml.apps.googleusercontent.com';
