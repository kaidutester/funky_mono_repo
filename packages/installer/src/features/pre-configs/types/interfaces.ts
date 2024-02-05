
export type ModalType = 'building' | 'floor' | 'location' | 'wifi';
export type ModalData = {
  title: string;
  defaultWifi: any;
  buildingName: string;
  floorName: string;
  locationName: string;
  itemId: string;
  itemType: string;
  operationType: string;
  [x: string]: any;
};

export type BasicCustomerListItem = {
  id: string;
  customer_id: string;
  customer_name: string;
};

export interface Zone {
  id: string;
  name: string;
  coords: {
    x: number;
    y: number;
  };
}

export interface FlooplanData {
  name: string;
  building: string;
  svg: string; //base64
  zones: Zone[];
}

export enum Validity {
  VALID = 'valid',
  INVALID = 'invalid',
  SOME_VALID = 'some',
}

export interface ItemCounts {
  floorCount: number;
  locationCount: number;
  wifiCount: number;
}
