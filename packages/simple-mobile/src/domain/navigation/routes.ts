export const WIFI_MODAL_SCREENS = {
  SELECTION: 'WifiSelectionModal',
  PASSWORD: 'PasswordModal',
  OTHER: 'OtherModal',
};

export const STACK_SCREENS = {
  HOME: 'Home',
  LOGIN: 'Login',
  SETUP: 'Setup',
  CUSTOMER: 'CustomerSelect',
  CONFIG: 'ConfigurationSetting',
  LTE_DIAGNOSE: 'LTEDiagnose',
  MANUAL_DIAGNOSE: 'ManualDiagnose',
  OPERATOR_LIST: 'OperatorList',
  SETTINGS: 'Settings',
  WIFI: {
    ...WIFI_MODAL_SCREENS,
    PARENT: 'WifiConfiguration'
  }
};

export const DRAWER_SCREENS = {
  INIT: "Init",
};