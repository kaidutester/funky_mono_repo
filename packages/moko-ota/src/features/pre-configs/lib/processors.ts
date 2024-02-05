import { CustomerListItem } from '~/types';
import { CustomersDeviceData } from '@kaidu/shared/features/kaidu-server';
import {
  FlooplanData,
  Zone,
  ItemCounts,
} from '../types';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { BasicCustomerListItem, Validity } from '../types';
import { helpers } from '~/utils';
import { isFilledArray } from '@kaidu/shared/utils';
import { replaceEmptyStringWithNull } from '@kaidu/shared/utils';


// return a valid subset of typed customer device data item
export function processSubmittedCustomerDeviceDataItem(
  input
): CustomersDeviceData {
  const trimmed = helpers.trimObjectProperties(input);
  const replaced = replaceEmptyStringWithNull(trimmed);
  const result: CustomersDeviceData = _.pick(replaced, [
    'id',
    'customer_device_data_id',
    'customer_id',
    'building',
    'floor',
    'location',
    'wifi_ssid',
    'wifi_password',
  ]) as CustomersDeviceData;
  return result;
}

/**
 * @description process and return a valid item for customer device data API
 * @param  {} input
 */
export function createNewCustomerDeviceData(input): CustomersDeviceData {
  const processed: CustomersDeviceData =
    processSubmittedCustomerDeviceDataItem(input);
  const result = Object.assign({}, processed, {
    id: uuidv4(),
    customer_device_data_id: uuidv4(),
  });
  return result;
}

export function createCountText(
  wifiCount,
  locationCount?: number,
  floorCount?: number,
  buildingCount?: number
): string {
  if (!wifiCount && !locationCount && !floorCount && !buildingCount) {
    return 'No pre-configured item in it';
  }

  const buildingText = buildingCount
    ? `${buildingCount} ${buildingCount > 1 ? 'buildings' : 'building'}`
    : '';
  const floorText = floorCount
    ? `${floorCount} ${floorCount > 1 ? 'floors' : 'floor'}`
    : '';
  const locationText = locationCount
    ? `${locationCount} ${locationCount > 1 ? 'locations' : 'location'}`
    : '';
  const wifiText = wifiCount
    ? `${wifiCount} ${wifiCount > 1 ? 'wifis' : 'wifi'}`
    : '';

  const text = `contains ${buildingText}${
    buildingCount && floorCount ? ',' : ''
  } ${floorText}${floorCount && locationCount ? ',' : ''}  ${locationText}${
    locationCount && wifiCount ? ',' : ''
  } ${wifiText}`;
  return text;
}

export function getBuildingItemCounts(buildingItem): ItemCounts {
  const floors = buildingItem?.floors;
  const floorCount = floors ? floors?.length : 0;
  const locations = buildingItem?.floors
    ?.map((floor) => floor.locations)
    .flat();
  const wifiCount = floors.reduce((acc, floor) => {
    const { locationCount, wifiCount } = getFloorItemCounts(floor);
    return acc + wifiCount;
  }, 0);

  const buildingItemCounts = getItemCounts(buildingItem);

  return {
    floorCount,
    locationCount: locations?.length ?? 0,
    wifiCount: wifiCount + buildingItemCounts?.wifiCount,
  };
}

export function getBuildingSummary(buildingItem) {
  const buildingItemCounts = getBuildingItemCounts(buildingItem);
  const floorCount = buildingItemCounts?.floorCount;
  const locationCount = buildingItemCounts?.locationCount;
  const wifiCount = buildingItemCounts?.wifiCount;

  const text = createCountText(wifiCount, locationCount, floorCount);
  return text;
}

export function getItemCounts(locationItem) {
  const ssid = locationItem?.default_wifi_ssid;
  return { wifiCount: ssid ? 1 : 0 };
}

export function getLocationSummary(locationItem) {
  const { wifiCount } = getItemCounts(locationItem);
  const text = createCountText(wifiCount);
  return text;
}

export function getFloorItemCounts(floorItem) {
  const locations = floorItem?.locations;
  const locationsWifiCount =
    locations?.reduce((acc, location) => {
      const { wifiCount } = getItemCounts(location);
      return acc + wifiCount;
    }, 0) ?? 0;
  // console.debug(`locationWifiCount: ${helpers.inspect(locationWifiCount)}`);
  const floorItemCounts = getItemCounts(floorItem);

  return {
    locationCount: locations?.length ?? 0,
    wifiCount: floorItemCounts.wifiCount + locationsWifiCount,
  };
}

export function getFloorSummary(floorItem) {
  const floorItemCounts = getFloorItemCounts(floorItem);
  const locationCount = floorItemCounts.locationCount;
  const wifiCount = floorItemCounts.wifiCount;
  const text = createCountText(wifiCount, locationCount);
  return text;
}

// filter preconfig data by customer name
export function filterByCustomerName(
  buildings,
  selectedCustomerName: string,
  customerList: BasicCustomerListItem[]
) {
  if (!isFilledArray(buildings)) {
    return [];
  }
  if (selectedCustomerName === 'all') {
    return buildings;
  }
  const selectedCustomer = customerList.find(
    (customerItem) => customerItem.customer_name === selectedCustomerName
  );

  return buildings.filter((building) => {
    const customerIdInBuilding =
      building?.floors[0]?.locations[0]?.wifis[0]?.customer_id;
    return customerIdInBuilding === selectedCustomer?.customer_id;
  });
}

export function filterByCustomerId(preconfigs, customerId) {
  console.debug(`filterByCustomerId is called`);
  console.debug(`Found ${preconfigs.length} preconfigs`);
  console.debug(`customerId is ${customerId}`);

  if (!isFilledArray(preconfigs) || !customerId) {
    return preconfigs;
  }
  const result = preconfigs.filter(
    (building) => building.customers_list_id === customerId
  );
  console.debug(
    `filterByCustomerId is finished with ${result.length} preconfigs`
  );
  return result;
}

// format floorplan data to match the API
export function formatAddFloorPlanData(collectedFloorplan: any): FlooplanData {
  // input: {floor, svg, building, zones: [{device_name, x, y, mqtt_device_id}]
  const zones: Zone[] = collectedFloorplan?.zones.map((zone) => {
    return {
      id: zone.mqtt_device_id,
      name: zone.device_name,
      coords: { x: zone.x, y: zone.y },
    };
  });
  const output = {
    name: collectedFloorplan.floor,
    building: collectedFloorplan.building,
    svg: collectedFloorplan.svg,
    zones,
  };
  return output;
}

/**
 *
 * @param customersList
 * @returns {customer_id, customer_name}[]
 */
export function extractIdNameFromCustomerList(
  customersList: CustomerListItem[]
): { customer_id; customer_name }[] {
  if (!isFilledArray(customersList)) {
    return [];
  }
  return customersList?.map((customer) => {
    if (!customer) {
      return null;
    }
    const { id, customer_id, customer_name } = customer;
    return { id, customer_id, customer_name };
  });
}

export function assignFloorsToBuildings(buildings, floors) {
  if (!isFilledArray(buildings) || !isFilledArray(floors)) {
    return buildings;
  }
  return buildings.map((building) => {
    if (!building) {
      return null;
    }
    const { customers_building_id } = building;
    const floorsOfSingleBuilding = floors.filter(
      (floor) => floor.customers_building_id === customers_building_id
    );
    return { ...building, floors: floorsOfSingleBuilding };
  });
}

export function assignLocationsToFloors(floors, locations) {
  if (!isFilledArray(floors) || !isFilledArray(locations)) {
    return floors;
  }
  return floors.map((floor) => {
    if (!floor) {
      return null;
    }
    const { customers_floor_id } = floor;
    const locationsOfSingleFloor = locations.filter(
      (location) => location.customers_floor_id === customers_floor_id
    );
    return { ...floor, locations: locationsOfSingleFloor };
  });
}

export function assignWifisToLocations(locations, customersDeviceData) {
  if (!isFilledArray(locations) || !isFilledArray(customersDeviceData)) {
    return locations;
  }
  return locations.map((location) => {
    if (!location) {
      return null;
    }
    const { customers_location_id } = location;
    const wifisOfSingleLocation = customersDeviceData.filter(
      (item) => item.customers_location_id === customers_location_id
    );
    return { ...location, wifis: wifisOfSingleLocation };
  });
}

export function processSubmittedFloorPlan(
  data,
  addedScanners,
  previewDimensions
) {
  // throw new Error(`Test error`);
  const collected = Object.assign({}, data);

  //send new floor plan to save svg and zones if it's submitted
  if (collected?.svg) {
    const submittedScanners = addedScanners.map((scanner) => {
      const { x, y } = convertXYPropertiesFromPixelsToPercent(
        previewDimensions,
        scanner
      );
      return _.merge({}, scanner, { x, y });
    });

    const collectedFloorplan = _.merge(
      {},
      _.pick(collected, ['floor', 'building', 'svg']),
      {
        zones: submittedScanners,
      }
    );
    const floorplan = formatAddFloorPlanData(collectedFloorplan);

    console.debug(
      `submitted floor plan (except svg) : ${helpers.inspect(
        _.omit(floorplan, ['svg'])
        // floorplan
      )}`
    );
    return floorplan;
  } else {
    throw new Error('Floor plan svg file not found!');
  }
}

export function findFloorplanInCustomerList(
  floorName,
  buildingName,
  customerId,
  customersList
) {
  const customer = customersList.find(
    (customer) => customer.customer_id === customerId
  );
  console.debug(`Found customer ${customer?.customer_id}`);
  const floorplans = customer?.customer_config?.floorplans;
  console.debug(`Found floorplans length: ${floorplans && floorplans?.length}`);
  if (isFilledArray(floorplans)) {
    const found = floorplans.find(
      (floorplan) =>
        floorplan?.building === buildingName && floorplan?.name === floorName
    );
    console.debug(`Found floorplan: ${found?.name}`);
    return found;
  }
  return null;
}

/**
 * @param  {any[]} serverConfig must have device_name, mqtt_device_id
 * @return sorted array of {device_name, mqtt_device_id}, uniq by device ids
 */
export function getDeviceNameAndIds(serverConfig: any[]): any[] {
  return _.sortBy(
    _.uniqBy(
      serverConfig.map((item) => {
        return {
          device_name: item?.device_name,
          mqtt_device_id: item?.mqtt_device_id,
        };
      }),
      'mqtt_device_id'
    ),
    ['device_name']
  );
}

/**
 * @param  {} {width, height} dimensions
 * @param  {} {x, y} in pixels, e.g. 640, 480, 720
 * @return {} {x, y} in percentage, e.g. 25, 50, 100
 */
export function convertXYPropertiesFromPixelsToPercent(dimensions, input) {
  const { width, height } = dimensions;
  const { x, y } = input;
  // console.debug(`percentage input: ${helpers.inspect(percentage)}`);
  // console.debug(`dimensions input: ${helpers.inspect(dimensions)}`);

  const relativeX = (parseInt(x) / parseInt(width)) * 100;
  const relativeY = (parseInt(y) / parseInt(height)) * 100;
  return { x: relativeX, y: relativeY };
}

/**
 * @param  {width, height} dimensions
 * @param  {x, y} in percentage, e.g. 25, 50, 100
 */
export function convertXYPropertiesFromPercentToPixels(dimensions, percentage) {
  const { width, height } = dimensions;
  const { x, y } = percentage;
  // console.debug(`percentage input: ${helpers.inspect(percentage)}`);
  // console.debug(`dimensions input: ${helpers.inspect(dimensions)}`);

  const pixelX = (parseInt(x) * parseInt(width)) / 100;
  const pixelY = (parseInt(y) * parseInt(height)) / 100;
  return { x: pixelX, y: pixelY };
}

export function getItemName(itemType: string, item): string {
  const { building, floor, location, buildingName, floorName, locationName } =
    item;

  switch (itemType) {
    case 'building':
      return building || buildingName;
    case 'floor':
      return floor || floorName;
    case 'location':
      return location || locationName;
    default:
      throw new Error('Invalid itemType');
  }
}
