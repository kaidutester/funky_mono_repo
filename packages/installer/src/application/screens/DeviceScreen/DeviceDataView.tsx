import React, {useState} from 'react';
import Popup from '../../../components/atomic/Popup';
import DeviceDataItem from './DeviceDataItem';
import {TextWrapper} from './styles/Styleds';

export function DeviceDataView({
  deviceName,
  beaconStatus,
  MQTTDeviceId,
  MQTTCert,
  isMQTTIdConsistent,
  isMQTTCertConsistent,
  wifiSsid,
  wifiPw,
  version,
  ...optionals
}) {
  const [openPWPopup, setOpenPWPopup] = useState(false);

  const handleWiFIPasswordPress = () => {
    setOpenPWPopup(true);
  };

  // console.debug(`Get wifi password: ${wifiPw.charCodeAt(0)}`);
  return (
    <>
      <TextWrapper>
        <DeviceDataItem label={'Device Name'} value={deviceName} />
        <DeviceDataItem label={'Beacon Status'} value={beaconStatus} accessibilityLabel='Beacon Status' />
        <DeviceDataItem
          label={'MQTT Device Id'}
          value={MQTTDeviceId}
          isConsistent={isMQTTIdConsistent}
        />
        <DeviceDataItem
          label={'MQTT Certificate'}
          value={MQTTCert}
          isConsistent={isMQTTCertConsistent}
        />
        <DeviceDataItem label={'WiFi SSID'} value={wifiSsid} />
        <DeviceDataItem
          onPress={handleWiFIPasswordPress}
          label={'WiFi Password'}
          value={wifiPw ? '*********' : '-'}
        />
        <DeviceDataItem
          label={'Hardware Version'}
          value={version && version.hw}
        />
        <DeviceDataItem
          label={'Software Version'}
          value={version && version.sw}
        />
      </TextWrapper>
      {Boolean(wifiPw) ? (
        <Popup
          text={'Password: ' + wifiPw}
          visible={openPWPopup}
          onConfirm={() => setOpenPWPopup(false)}
        />
      ) : null}
    </>
  );
}
