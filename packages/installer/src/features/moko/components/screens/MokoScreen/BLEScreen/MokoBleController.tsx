import React, { useEffect, useState } from 'react';
import { AndroidMokoModule } from '~/lib/NativeModules';
import Text from '~/components/atomic/Text';
import { LongTextContainer } from '../../../organism/MokoScreenFrame';

const MokoModule = AndroidMokoModule;

/**
 * 
 */
export function MokoBleController({ device, onSuccess, ...optionals }) {
  const { onError, ...rest } = optionals;
  const { id: mac } = device;
  const [displayedMsg, setDisplayedMsg] = useState(
    'Waiting for connection via Bluetooth',
  );

  /**
   * connect via BLE, saved MQTT config will be set automatically when it's connected
   */
  const connectDeviceViaBLE = async () => {
    const bleConnectioncallback = deviceMac => {
      console.debug('bleConnectioncallback is called');
    };
    if (MokoModule) {
      await MokoModule.connectBLE(mac, bleConnectioncallback);
    } else {
      return Promise.reject();
    }


    let isConnectedToMQTT = false;
    while (!isConnectedToMQTT) {
      // TODO: 
      // connect to MQTT server and check if the plug is connected to the server

      isConnectedToMQTT = true;
    }

    return true;
  };

  useEffect(() => {
    setDisplayedMsg('connecting via Bluetooth. Light should turn to solid blue soon.');

    // TODO: set 1 min timeout if the BLE doesn't connect & disconnect
    connectDeviceViaBLE()
      .then(res => {
        const msg = 'Please keep your device close to the scanner until you see the solid green light turn to blue';
        console.debug(msg);
        setDisplayedMsg(msg);
        onSuccess && onSuccess();
      })
      .catch(error => { // disconnect device if error
        console.error(`connectDeviceViaBLE failed ${error?.message}`);
        if (MokoModule) {
          MokoModule.disconnectBLE();
        }
        setDisplayedMsg('Failed to connect Moko device with the MQTT server. If the light is still solid green, Please force close this APP and retry. If it\'s blinking green, go back to home and restart.');
        onError && onError();
      });
  }, []);

  return (
    <LongTextContainer>
      <Text>{displayedMsg}</Text>
    </LongTextContainer>
  );
}
