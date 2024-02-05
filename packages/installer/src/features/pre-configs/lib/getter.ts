import { ModalData, DefaultWifi } from '../types';

export function getDefaultWifiFromItem(item): DefaultWifi {
  const { default_wifi_ssid, default_wifi_password } = item;
  return { default_wifi_ssid, default_wifi_password };
}

export function getDefaultWifiFromItemAndParent(item, parent): DefaultWifi {
  const itemWifi = getDefaultWifiFromItem(item);
  const parentWifi = getDefaultWifiFromItem(parent);

  if (itemWifi && itemWifi?.default_wifi_ssid) {
    return itemWifi;
  } else {
    return parentWifi;
  }
}

export function getDefaultWifiFormModal(modalData: ModalData) {
  const { defaultWifi, item }: ModalData = modalData;

  const hasDefaultWifiInItem = Boolean(item?.default_wifi_ssid);

  const default_wifi_ssid = hasDefaultWifiInItem
    ? item?.default_wifi_ssid
    : defaultWifi?.default_wifi_ssid;
  const default_wifi_password = hasDefaultWifiInItem
    ? item?.default_wifi_password
    : defaultWifi?.default_wifi_password;
  return { default_wifi_ssid, default_wifi_password };
}

export function getDefaultValues(modalData: ModalData, customerId: string) {
  const {
    defaultWifi,
    buildingName,
    floorName,
    locationName,
    operationType,
    item,
    itemType,
    itemId,
    title,
    customerDeviceDataId,
  }: ModalData = modalData;

  const processedDefaultWifi = getDefaultWifiFormModal(modalData);

  const defaultValues = {
    customer_id: customerId,
    building: buildingName,
    building_name: buildingName,
    floor: floorName,
    location: locationName,
    ...processedDefaultWifi,
  };

  return defaultValues;
}


// return a boolean of properties: customers_building_id && customers_location_id && customers_floor_id
export function hasAllPreconfigIds(data: any) {
  const { customers_building_id, customers_location_id, customers_floor_id } = data || {};
  return Boolean(customers_building_id && customers_location_id && customers_floor_id);
}