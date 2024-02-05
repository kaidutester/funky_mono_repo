export type FormValues = {
  device_name: string;
  customer_name: string;
  building: string;
  location: string;
  wifi_ssid: string;
  wifi_password: string;
  mqtt_device_id: string;
  mqtt_device_certificate: string;
  [x: string]: any;
};