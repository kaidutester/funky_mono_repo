import { useRoute } from '@react-navigation/native';
import _ from 'lodash';
import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';
import { Divider } from 'react-native-elements';
import { tailwind } from '@kaidu/shared/lib/styles';
import ScrollView from '~/components/atomic/ScrollView';
import { View } from '@kaidu/shared/components/atomic';
import { getDistinctProperties } from '~/lib/data-operations';
import { STACK_SCREENS } from '~/navigation/routes';
import { inspect } from '@kaidu/shared/utils';
import { Centered } from '../../atomic/Layouts';
import { KeyValuePair } from '@kaidu/shared/components/molecule/KeyValuePair';
import { FormValues } from './interface';
import { NavigatableItem } from './NavigatableItem';
import { NavigatableItemWithMulti } from './NavigatableItemWithMulti';
import { SubmitBtn } from './style';
import { FloorDTO, LocationDTO } from '@kaidu/shared/features/kaidu-server';

/**
 * A form submits device configuration input from user.
 */
export default function ServerConfigForm({
  onSubmit,
  optionsList,
  defaultValues,
  fixedValues,
  ...optionals
}: {
  onSubmit: (data) => any;
  [x: string]: any;
}) {
  // Configuration variables should be submitted:
  // - device name, mac address, customer name, building, floor, location, WiFi ssid, WiFi password, mqtt device id, mqtt_device_certificate, rssi_threshold

  // variables may be changed by user:
  // device name, customer name, building, floor, location, wifi ssid, wifi password

  // variables must be provided by server:
  // mqtt device id, mqtt device certificate,

  // variables may be changed by server:
  // device name, customer name, building, floor, location, wifi ssid, wifi password

  // variables must be provided by scanner:
  // mac address,

  // options provided by server:
  //   - customers list
  //   - buildings, floors, locations list

  // State logic
  // customer name changes -> fetch buildings, floors, locations from customers device data -> pass them to children
  // building changes -> filter floors, locations based on building

  // console.debug(`ServerConfigForm is rendered`);

  // Props
  const {
    wifi_ssid: defaultSsid,
    wifi_password: defaultPassword,
    customer_name: defaultCustomerName,
    customer_id: defaultCustomerID,
  } = defaultValues || {};
  const { mac, mqtt_device_id, mqtt_device_certificate } = fixedValues || {};
  const {
    buildings,
    floors,
    locations,
    rawCustomersList: customersList,
    customerNames,
    rssiThresholdList,
  }: { floors: FloorDTO[], locations: LocationDTO[], [x: string]: any } = optionsList || {};

  // Hooks
  const { control, setValue, getValues } = useForm<FormValues>({
    defaultValues: {
      mqtt_device_certificate,
      mqtt_device_id,
      mac_address: mac,
      customer_name: defaultCustomerName,
      customer_id: defaultCustomerID,
      wifi_ssid: defaultSsid,
      wifi_password: defaultPassword,
    }
  });
  const route = useRoute();
  const {
    device_name,
    building,
    floor,
    location,
    wifi_ssid,
    wifi_password,
    customer_name,
    rssi_threshold_id,
  } = (route.params as any) || {}; // values updated locally


  // States
  // customer in form
  const customerNameMemo = useMemo(() => customer_name, [customer_name]);
  const deviceNameMemo = useMemo(() => device_name, [device_name]);
  const customerIDMemo = useMemo(() => {
    const customer = customersList?.find(
      (c) => c.customer_name === customer_name
    );
    return customer ? customer?.customer_id : null;
  }, [customer_name]);
  // const pickedParam = useMemo(
  //   () =>
  //     _.pick(route.params, [
  //       'mac_address',
  //       'device_name',
  //       'customer_name',
  //       'building',
  //       'location',
  //       'floor',
  //       'wifi_ssid',
  //       'wifi_password',
  //       'mqtt_device_id',
  //       'mqtt_device_certificate',
  //     ]),
  //   [route.params]
  // );

  // when selected customer changes, update available building, floor, location options
  const buildingNames = useMemo(() => {
    if (buildings) {
      console.debug(`Buildings options updated`);
      // console.debug(`Unfilted Buildings options: ${inspect(buildings)}`);
      // console.debug(`customerID for filtering: ${customerIDMemo}`);
      const filteredByCustomer = _.filter(buildings, {
        customers_list_id: customerIDMemo,
      });
      const result =
        getDistinctProperties(filteredByCustomer, 'building_name') ?? [];
      // console.debug(`Buildings options: ${result}`);
      return result;
    }
  }, [buildings, customerIDMemo]);

  const floorNames = useMemo(() => {
    if (building && customerIDMemo) {
      // console.debug(`Floors options updated`);
      const buildingId = buildings?.find(b => b.building_name === building)?.customers_building_id;
      const filteredByCustomer = _.filter(floors, {
        customers_list_id: customerIDMemo,
        customers_building_id: buildingId,
      });
      const result =
        getDistinctProperties(filteredByCustomer, 'floor_name') ?? [];
      return result;
    }
  }, [customerIDMemo, building]);

  const locationNames = useMemo(() => {
    if (customerIDMemo && building && floor) {
      console.debug(`Locations options updated`);
      const floorId = floors?.find(f => f.floor_name === floor)?.customers_floor_id;
      const filteredByCustomer = _.filter(locations, {
        customers_list_id: customerIDMemo,
        customers_floor_id: floorId,
      });
      const result =
        getDistinctProperties(filteredByCustomer, 'location_name') ?? [];

      return result;
    }
  }, [customerIDMemo, building, floor]);

  const handleSubmitBtnPress = () => {
    console.debug('submit btn pressed. start to process form data');
    const { customers_list_id } =
      (route.params as any) || {};
    // Prepare data for submission
    // set changable values to form
    setValue('customer_name', customerNameMemo);
    setValue('device_name', device_name);
    setValue('building', building);
    setValue('floor', floor);
    setValue('location', location);
    setValue('wifi_ssid', wifi_ssid);
    setValue('wifi_password', wifi_password);
    setValue('customers_list_id', customers_list_id);
    rssi_threshold_id && setValue('rssi_threshold_id', rssi_threshold_id);

    console.debug(`building in params: ${building}`);
    const customers_building_id = buildings.find(
      (item) => item?.building_name === building
    )?.customers_building_id;
    console.debug(`Found customers_building_id: ${customers_building_id}`);
    const customers_floor_id = floors.find(
      (item) => item?.floor_name === floor && item?.customers_building_id === customers_building_id
    )?.customers_floor_id;
    const customers_location_id = locations.find(
      (item) => item?.location_name === location && item?.customers_floor_id === customers_floor_id
    )?.customers_location_id;

    setValue('customers_building_id', customers_building_id);
    setValue('customers_floor_id', customers_floor_id);
    setValue('customers_location_id', customers_location_id);

    const formValues = getValues();
    // console.debug(`formValues: ${helpers.inspect(formValues)}`);

    // Validate
    if (!formValues?.customer_name) {
      Alert.alert('Invalid Data! No customer name in submission!');
      return;
    }

    // submit to server
    console.debug(`Submit data: ${inspect(formValues)}`);

    onSubmit(formValues);
  };

  const isReadyToSubmit = mac && mqtt_device_id && mqtt_device_certificate && device_name && wifi_ssid && customerIDMemo;

  return (
    <ScrollView
      keyboardShouldPersistTaps='always'
      style={tailwind('max-h-full mb-10')}
    >
      <View>
        <KeyValuePair label={'MAC Address'} value={mac} />
        <KeyValuePair label={'MQTT Device ID'} value={mqtt_device_id} />
        <KeyValuePair
          label={'MQTT Device Certificate'}
          value={mqtt_device_certificate}
        />
        <Divider style={{ marginVertical: 10 }} />
        <NavigatableItem
          value={deviceNameMemo}
          name={'device_name'}
          screenName={STACK_SCREENS.SETUP.SINGLE_INPUT}
          label='Device Name'
          setValue={setValue}
        />
        <NavigatableItem
          value={customerNameMemo}
          name={'customer_name'}
          screenName={STACK_SCREENS.SETUP.SELECT_INPUT}
          label='Customer Name'
          options={customerNames}
          hasCreate={false}
          resetNames={[
            'building',
            'floor',
            'location',
            'wifi_ssid',
            'wifi_password',
          ]}
        />
        {customer_name ? (
          <NavigatableItem
            value={building}
            name={'building'}
            screenName={STACK_SCREENS.SETUP.SELECT_INPUT}
            label='Building'
            options={buildingNames}
            resetNames={['floor', 'location', 'wifi_ssid', 'wifi_password']}
          />
        ) : null}
        {building ? (
          <NavigatableItem
            options={floorNames}
            value={floor}
            control={control}
            name='floor'
            label='Floor'
            screenName={STACK_SCREENS.SETUP.SELECT_INPUT}
            resetNames={['location', 'wifi_ssid', 'wifi_password']}
          />
        ) : null}
        {building && floor ? (
          <NavigatableItem
            options={locationNames}
            value={location}
            name='location'
            label='Location'
            screenName={STACK_SCREENS.SETUP.SELECT_INPUT}
          />
        ) : null}
        <NavigatableItem
          options={rssiThresholdList?.map(item => item?.rssi_thresholds_name)}
          value={rssi_threshold_id}
          name='rssi_thresholds_id'
          label='RSSI Threshold'
          screenName={STACK_SCREENS.SETUP.SELECT_INPUT}
          hasCreate={false}
        />
        <NavigatableItemWithMulti
          values={[defaultSsid, defaultPassword]}
          names={['wifi_ssid', 'wifi_password']}
          label='Wi-Fi'
          screenName={STACK_SCREENS.SETUP.WIFI}
          displayedValue={wifi_ssid}
        />
      </View>
      {isReadyToSubmit ? (
        <Centered style={tailwind('mt-16')}>
          <SubmitBtn
            title='Program'
            onPress={handleSubmitBtnPress}
            accessibilityLabel={'Program'}
          />
        </Centered>
      ) : null}
    </ScrollView>
  );
}
