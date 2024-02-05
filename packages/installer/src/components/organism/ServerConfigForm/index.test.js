import React from 'react';
// import ServerConfigForm from './index';
import {fireEvent, render, waitFor} from '@testing-library/react-native';

const existedData = {
  device_name: 'KaiduScanner',
  mac_address: '00:1B:44:11:3A:B7',
  customer_name: 'Safetrack',
  building: 'AsherHome',
  location: 'Main room',
  wifi_ssid: 'SDKSDK',
  wifi_password: '123123',
  mqtt_device_id: 'someid',
  mqtt_device_certificate: 'somecert',
};

const devicesOfCustomer = [
  {
    id: '3775788f-e2a3-432a-a610-c1a6945d6221',
    customer_device_data_id: 'd5c420d6-5bff-4f5e-bd26-cc390ebe28dd',
    customer_id: '647b9112-8305-4ef8-9143-ab63c8f7751f',
    building: 'BahirHouse',
    location: 'LivingRoom',
    floor: '1st floor',
    wifi_ssid: null,
    wifi_password: null,
  },
  {
    id: 'b9be85ba-d7f9-4162-8406-50949871844e',
    customer_device_data_id: 'db8700e2-abd1-4ba4-8def-baac321720cf',
    customer_id: '647b9112-8305-4ef8-9143-ab63c8f7751f',
    building: 'Lucas’s Home',
    location: 'LivingRoom',
    floor: 'Main Floor Lucas',
    wifi_ssid: 'Lucas e Vivian',
    wifi_password: 'lololo000',
  },
];

test.skip('examples of some things', async () => {
//   const {getByTestId, getByText, queryByTestId, toJSON} = render(
//     <ServerConfigForm
//       existedData={existedData}
//       onSubmit={() => console.log('Hello')}
//     />,
//   );

//   // const input = getByTestId('input');
//   // fireEvent.changeText(input, famousProgrammerInHistory);

//   // const button = getByText('Print Username');
//   // fireEvent.press(button);

//   // await waitFor(() => expect(queryByTestId('printed-username')).toBeTruthy());

//   // expect(getByTestId('printed-username').props.children).toBe(
//   //   famousProgrammerInHistory,
//   // );
//   // expect(toJSON()).toMatchSnapshot();
});
