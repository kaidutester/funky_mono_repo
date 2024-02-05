import React, { useEffect, useState, useMemo } from 'react';
import Text from '~/components/atomic/Text';
import { getMokoBasicModule } from '~/lib/NativeModules';
import { inspect } from '~/utils';
import { sleep } from '@kaidu/shared/utils';
import { useSelector } from 'react-redux';
import { selectMokoGlobalConfig } from '~/domains/moko/providers/mokoSlice';
import { LongTextContainer } from '../../../domains/moko/components/organism/MokoScreenFrame';
import { generateMQTTConfig } from './processors';

const MokoModule = getMokoBasicModule();


/**
 * set Moko MQTT configuration when it's mounted
 */
export function MokoConfigController({
  onSuccess,
  data,
  send,
  ...optionals
}: {
  onSuccess: Function;
  data: any;
  [x: string]: any;
}) {
  // Props
  const { onError, ...rest } = optionals;
  const { wifi, mac } = data || {};

  // Global states
  const { mqttServerHost, mqttServerPort } = useSelector(
    selectMokoGlobalConfig
  );

  const generatedMQTTConfig = useMemo(() => {
    return generateMQTTConfig(data, { mqttServerHost, mqttServerPort });
  }, [mac]);

  /**
   * generate MQTT config to be saved the Moko device, and pass them to the native module
   */
  const setMQTTConfig = async () => {
    console.debug(`setMQTTConfig is called`);
    console.debug(`start to set MQTT config in the APP`);

    // use native module
    if (MokoModule) {
      console.debug(`setMqttConfigToBeWritten is called`);
      const {
        mqttServerHost,
        mqttServerPort,
        deviceClientId,
        deviceId,
        devPublish,
        devSubscribe,
        ssid,
        password,
      } = generatedMQTTConfig || {};


      console.debug(
        `Set MQTT Config To Be Written as: ${inspect(generatedMQTTConfig)}`,
      );
      await MokoModule.setMqttConfigToBeWritten(
        mqttServerHost,
        mqttServerPort,
        deviceClientId,
        deviceId,
        devPublish,
        devSubscribe,
        ssid,
        password
      );
      send({ type: 'UPDATE_MQTT_CONFIG', data: generatedMQTTConfig });
      send({ type: 'UPDATE_SCANNER_DEVICE_ID', data: deviceId });
    }
    console.debug(new Date().toLocaleString());
    await sleep(2000);
    console.debug(new Date().toLocaleString());
    console.debug(`setMQTTConfig is finished`);
    return true;
  };

  const isWifiValid = wifi && wifi?.ssid;

  useEffect(() => {
    console.debug(`MokoConfigController mounted`);
    if (isWifiValid) {
      setMQTTConfig()
        .then((res) => {
          onSuccess && onSuccess();
        })
        .catch((error) => {
          console.error(`setMQTTConfig error state ${error?.message}`);
          onError && onError();
        });
    }
  }, []);

  if (!isWifiValid) {
    // no data
    return <Text>Error: No Wi-Fi crendial is passed</Text>;
  }

  return (
    <LongTextContainer>
      {/* <Text>{displayedMsg}</Text> */}
    </LongTextContainer>
  );
}
