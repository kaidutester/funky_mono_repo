import {checkIsPreconfigIncluded} from './pre-requests'

describe('checkIsPreconfigIncluded', () => {
  const list = [
    {
      id: 'cdcd9d85-10c7-4afc-bb26-3563d85ef1b7',
      customer_device_data_id: 'a14bb0d0-a657-401e-8cec-3870e92f26db',
      customer_id: '647b9112-8305-4ef8-9143-ab63c8f7751f',
      building: "Giri's Home",
      location: 'Office',
      floor: '2nd floor',
      wifi_ssid: 'liveandletlivefor5years',
      wifi_password: 'amarakone2021',
    },
    {
      id: '9501740c-91da-436d-9201-6c0e259ed37c',
      customer_device_data_id: 'f7bf480f-932a-43f5-8d6f-a0009a9a6a6e',
      customer_id: '647b9112-8305-4ef8-9143-ab63c8f7751f',
      building: 'Main',
      location: 'Kitchen',
      floor: 'Floor16th',
      wifi_ssid: 'BELL204',
      wifi_password: 'A16927412E6D',
    },
    {
      id: '47442e01-e0b9-4eba-8d04-315ade66e816',
      customer_device_data_id: '47442e01-e0b9-4eba-8d04-315ade66e816',
      customer_id: '64b74c06-7f6f-42cc-a0fc-00c74893935d',
      building: 'area51',
      location: 'loc2',
      floor: 'main-hangar',
      wifi_ssid: 'ssid',
      wifi_password: 'secret',
    },
  ];

  test(`should return matched when it exists`, () => {
    const input = {
      id: 'cdcd9d85-10c7-4afc-bb26-3563d85ef1b7',
      customer_device_data_id: 'a14bb0d0-a657-401e-8cec-3870e92f26db',
      customer_id: '647b9112-8305-4ef8-9143-ab63c8f7751f',
      building: "Giri's Home",
      location: 'Office',
      floor: '2nd floor',
      wifi_ssid: 'liveandletlivefor5years',
      wifi_password: 'amarakone2021',
    };

    expect(checkIsPreconfigIncluded(input, list)).toEqual(input);
  });

  test(`should return null when there is a new building, floor, location, `, () => {
    const input = {
      id: 'cdcd9d85-10c7-4afc-bb26-3563d85ef1b7',
      customer_device_data_id: 'a14bb0d0-a657-401e-8cec-3870e92f26db',
      customer_id: '647b9112-8305-4ef8-9143-ab63c8f7751f',
      building: "Giri's Home",
      location: 'Office',
      floor: '2nd floor',
      wifi_ssid: 'liveandletliv5years',
      wifi_password: 'amarakone2021',
    };

    expect(checkIsPreconfigIncluded(input, list)).toBeNull();
  });
});