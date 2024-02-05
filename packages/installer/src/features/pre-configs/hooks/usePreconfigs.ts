import {
  useCustomersList,
  useCustomersDeviceData,
  BuildingDTO,
  useBuildingPreconfigs,
  useFloorPreconfigs,
  useLocationPreconfigs,
} from '@kaidu/shared/features/kaidu-server';
import { assignValidityToPreconfig } from '../lib';
import {
  extractIdNameFromCustomerList,
  assignFloorsToBuildings,
  assignLocationsToFloors,
  assignWifisToLocations,
} from '../lib';
import _ from 'lodash';

export function usePreconfigPageData() {
  // should return a preconfig list and a customer list

  const {
    customerDeviceData,
    isLoading: isLoadingCustomersDeviceData,
    isError: isCustomersDeviceDataError,
  } = useCustomersDeviceData();

  const { buildings, isLoadingBuildings, isBuildingsError } =
    useBuildingPreconfigs();

  const { floors, isLoadingFloors, isFloorsError } = useFloorPreconfigs();

  const { locations, isLoadingLocations, isLocationsError } =
    useLocationPreconfigs();

  const {
    customersList,
    isLoading: isCustomersListLoading,
    isError: isCustomersListError,
  } = useCustomersList();

  // const isPreconfigLoading = allPreconfigs === undefined && !allPreconfigsError;

  const processedLocations = assignWifisToLocations(
    locations,
    customerDeviceData
  );
  const processedFloors = assignLocationsToFloors(floors, locations);
  const combined = assignFloorsToBuildings(buildings, processedFloors);
  const buildingsWithValidity = assignValidityToPreconfig(combined) ?? combined;

  return {
    preconfigData: _.sortBy(buildingsWithValidity, 'building_name'),
    // foo: allPreconfigs,
    customersList: _.sortBy(
      extractIdNameFromCustomerList(customersList),
      'customer_name'
    ),
    buildings,
    floors,
    locations,
    isLoading:
      // isPreconfigLoading ||
      isCustomersListLoading ||
      isLoadingBuildings ||
      isLoadingFloors ||
      isLoadingLocations ||
      isLoadingCustomersDeviceData,
    isError:
      // allPreconfigsError ||
      isCustomersListError ||
      isBuildingsError ||
      isFloorsError ||
      isLocationsError ||
      isCustomersDeviceDataError,
  };
}