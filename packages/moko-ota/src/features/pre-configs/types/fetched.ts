export type LocationDTO = {
  id?: string;
  customers_location_id?: string;
  customers_floor_id: string;
  customers_list_id: string;
  location_name: string;
  default_wifi_ssid?: string;
  default_wifi_password?: string;
  [x: string]: any;
};

export type FloorDTO = {
  id?: string;
  customers_floor_id?: string;
  customers_building_id: string;
  customers_list_id: string;
  floor_name: string;
  default_wifi_ssid?: string;
  default_wifi_password?: string;
  [x: string]: any;
};

export interface DefaultWifi {
  default_wifi_ssid: string;
  default_wifi_password: string;
};

export type BuildingDTO = {
  id?: string;
  customers_building_id?: string;
  customers_list_id: string;
  building_name: string;
  default_wifi_ssid?: string;
  default_wifi_password?: string;
  [x: string]: any;
};

const BASE_PROPS = [
  'default_wifi_ssid',
  'default_wifi_password',
  'id',
  'customers_list_id',
];

export const LOCATION_PROPS = [
  ...BASE_PROPS,
  'customers_location_id',
  'customers_floor_id',
  'location_name',
];

export const FLOOR_PROPS = [
  ...BASE_PROPS,
  'customers_building_id',
  'customers_floor_id',
  'floor_name',
];

export const BUILDING_PROPS = [
  ...BASE_PROPS,
  'customers_building_id',
  'building_name',
];