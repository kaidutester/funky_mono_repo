import * as app from '../app.json';
import { version } from '../../package.json';

//App globals
export const NAME = app?.name;
export const DISPLAY_NAME = app?.displayName;
export const VERSION = version;
