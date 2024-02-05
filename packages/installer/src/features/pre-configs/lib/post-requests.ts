import { isFilledArray } from '@kaidu/shared/utils';
import { DefaultWifi } from '../types';

// extract { default_wifi_ssid, default_wifi_password } from fetched data
export function getWifiFromFetchedItem(buildingItem): DefaultWifi | null {
  try {
    const { default_wifi_ssid, default_wifi_password } = buildingItem;
    return {
      default_wifi_ssid: default_wifi_ssid,
      default_wifi_password: default_wifi_password,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

// is valid if the item has at least one combination of building, floor, location, wifi
// each building should has at least one floor
// each floor should has at least one location
// each location should has at least one wifi
export function assignValidityToPreconfig(input: any) {
  if (!isFilledArray(input)) {
    return input;
  }

  return input?.map((building) => {
    //process locations
    const floors = building?.floors;

    if (isFilledArray(floors)) {
      const processedFloors = floors?.map((floor) => {
        const locations = floor.locations;

        if (isFilledArray(locations)) {
          const processedLocations = locations?.map((location) => {
            const hasWifi =
              location?.default_wifi_ssid ||
              floor?.default_wifi_ssid ||
              building?.default_wifi_ssid;
            const result = {
              ...location,
              validity: hasWifi ? 'valid' : 'invalid',
            };
            !hasWifi &&
              Object.assign(result, {
                validityText: 'No default Wi-Fi can be found for this location',
              });
            return result;
          });

          const invalidLoc = processedLocations?.find(
            (location) => location.validity === 'invalid'
          );

          const result = {
            ...floor,
            locations: processedLocations,
          };

          invalidLoc
            ? Object.assign(result, {
                validity: 'invalid',
                validityText: `Location ${invalidLoc.location_name} is invalid`,
              })
            : Object.assign(result, { validity: 'valid' });

          return result;
        } else {
          return {
            ...floor,
            validity: 'invalid',
            validityText: 'No location in this floor',
          };
        }
      });

      const invalidFloor = processedFloors?.find(
        (floor) => floor.validity === 'invalid'
      );

      const result = {
        ...building,
        floors: processedFloors,
      };

      invalidFloor
        ? Object.assign(result, {
            validity: 'invalid',
            validityText: `Floor ${invalidFloor.floor_name} is invalid`,
          })
        : Object.assign(result, { validity: 'valid' });

      return result;
    } else {
      return {
        ...building,
        validity: 'invalid',
        validityText: 'No floor in the building',
      };
    }
  });
}
