import React, { useEffect, useState } from 'react';
import Text from '~/components/atomic/Text';
import { MokoProcessor } from '~/lib/moko-device';
import { AndroidMokoModule } from '~/lib/NativeModules';
import { sleep, inspect } from '@kaidu/shared/utils';
import { useSelector } from 'react-redux';
import { selectMokoGlobalConfig } from '~/features/moko/providers/mokoSlice';
import { Wifi } from '@kaidu/shared/features/wifi';
import { DISPLAY_NAME } from '~/lib/constants';
import { LongTextContainer } from '../../../organism/MokoScreenFrame';
import { ScannedDevice } from '@kaidu/shared/features/ble-general/types';
import { generateDeviceClientID } from '../../../../processors';
import { getAPPClientIDForMQTT } from '../../../../../firmware';

const MokoModule = AndroidMokoModule;

export default function MokoConfigController({
  onSuccess,
  device,
  wifi,
  ...optionals
}: {
  onSuccess: Function;
  device: ScannedDevice;
  wifi: Wifi;
  [x: string]: any;
}) {
  // set Moko MQTT configuration when it's mounted

  // Props
  const { onError, ...rest } = optionals;
  const { name, localName, id: mac } = device;

  // Global states
  const appClientId = getAPPClientIDForMQTT();
  const { mqttServerHost, mqttServerPort } = useSelector(selectMokoGlobalConfig);

  // Local state
  const [displayedMsg, setDisplayedMsg] = useState(
    'Preparing MQTT Configuration data',
  );

  // execute setting MQTT config to the Moko device
  const setMQTTConfig = async (name, mac, ssid, password) => {
    console.debug(`setMQTTConfig is called`);
    console.debug(`start to set MQTT config in the APP`);
    const deviceName = name || localName;
    const [deviceId, devPublish, devSubscribe] = MokoProcessor.createMQTTConfig(
      deviceName,
      mac,
    );
    const deviceClientId = generateDeviceClientID(appClientId, deviceId);


    // use native module
    if (MokoModule) {
      console.debug(`setMqttConfigToBeWritten is called`);
      console.debug(
        `inputs: ${inspect({
          mqttServerHost,
          mqttServerPort,
          deviceClientId,
          deviceId,
          devPublish,
          devSubscribe,
          ssid,
          password,
        })}`,
      );

      await MokoModule.setMqttConfigToBeWritten(
        mqttServerHost,
        mqttServerPort,
        deviceClientId,
        deviceId,
        devPublish,
        devSubscribe,
        ssid,
        password,
      );
    }
    console.debug(`setMQTTConfig is finished`);
    console.debug(new Date().toLocaleString());
    await sleep(2500);
    console.debug(new Date().toLocaleString());
    return true;
  };

  useEffect(() => {
    console.debug(`MokoConfigController mounted`);
    if (wifi && wifi?.ssid) {
      const { ssid, password } = wifi;

      const msg = `saving MQTT config on ${DISPLAY_NAME}. Light should be blinking green.`;
      console.debug(msg);

      setDisplayedMsg(msg);

      const nameForMQTTConfig = name ?? localName;

      setMQTTConfig(nameForMQTTConfig, mac, ssid, password)
        .then(res => {
          onSuccess && onSuccess();
        })
        .catch(error => {
          console.error(`setMQTTConfig error state ${error?.message}`);
          onError && onError();
        });
    }
  }, []);

  if (!wifi || !wifi?.ssid) {
    // no data
    return null;
  }

  return (
    <LongTextContainer>
      <Text>{displayedMsg}</Text>
    </LongTextContainer>
  );
}
