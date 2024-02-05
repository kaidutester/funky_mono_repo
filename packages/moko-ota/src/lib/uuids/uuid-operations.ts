import characteristic_uuids from './gatt-uuid/characteristic_uuids.json';
import descriptor_uuids from './gatt-uuid/descriptor_uuids.json';
import service_uuids from './gatt-uuid/service_uuids.json';

/**
 * @description
 * @return 4 digits assigned number of UUID, uppercase
 */
export function get16BitsUUID(uuid: string): string {
  return uuid.substring(4, 8).trim().toUpperCase();
}

export function findBy16BitsUUID(uuids: string[], uuid16bits: string): string | undefined {
  return uuids.find(uuid => get16BitsUUID(uuid) === uuid16bits.toUpperCase());
}
/**
 * @description
 * @return allocated name of the 16bits uuid
 */

export function get16BitsUUIDInfo(uuid16bits: string): string {
  const result = characteristic_uuids.find(char => char.uuid === uuid16bits) || descriptor_uuids.find(desc => desc.uuid === uuid16bits) || service_uuids.find(service => service.uuid === uuid16bits);

  if (result) {
    return result.name;
  }

  return 'UNKNOWN';
}
/**
 * @description map the full UUID to the standard 16bits UUID assigned value
 * @return allocated value of the uuid
 */

export function getUUIDAllocatedValue(uuid: string): string {
  return get16BitsUUIDInfo(get16BitsUUID(uuid));
}
  