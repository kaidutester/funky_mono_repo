import {
  getBuildingSummary,
  getBuildingItemCounts,
} from '../processors';
import {
  singleBuilding,
  output,
  singleBuilding2,
  output2,
  building1,
  building2,
  building3,
  buildingTest,
  countsOutput,
} from './constants';

test('count building1', () => {
  expect(getBuildingItemCounts(building1)).toEqual({
    floorCount: 1,
    locationCount: 2,
    wifiCount: 2,
  });
});

test('count building2', () => {
    expect(getBuildingItemCounts(building2)).toEqual({
      floorCount: 0,
      locationCount: 0,
      wifiCount: 0,
    });
  });
  

test.skip('getBuildingSummary should return counts of floor, location, and wifi', () => {
  const counts = getBuildingItemCounts(buildingTest);
  expect(counts).toEqual(countsOutput);
  expect(getBuildingSummary(buildingTest)).toEqual(
    'contains 3 floors, 5 locations, 8 wifis'
  );
});
