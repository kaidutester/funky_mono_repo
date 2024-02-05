import React, { useState, useRef, useEffect } from 'react';
import Button from '../atomic/Button';
import { startWiFiFirmwareUpdate, checkUpdateResultOfKaiduScanner } from '@kaidu/shared/features/ble-kaidu';
import { sleep } from '@kaidu/shared/utils';
import { selectDeviceStatistics } from '../../lib/redux/deviceSlice';
import { useSelector } from 'react-redux';
import { Alert } from 'react-native';
import { connectAndDiscoverDevice, cancelConnection } from '@kaidu/shared/features/ble-general';
import { Version } from '../../types/interfaces';
import BaseUpdateMsg from '../molecule/BaseUpdateMsg';
import ChangingText from '../molecule/ChangingText';
import { fetchLatestSoftwareVersion } from '@kaidu/shared/features/kaidu-server/kaidu-firmware-list';

/**
 * send firmware update command to scanner via BLE, scanner will start to execute OTA update via Wi-Fi
 * steps: idle -> start -> fetch latest compatible version -> send update command -> verify update result
 */
export function WiFiOTABtn({ deviceId, version, isUpdating, onUpdating, title, ...optionals }) {
  // Props
  const { ...rest } = optionals;
  const versionBefore = version as Version;

  // Global states
  const statsBefore = useSelector(selectDeviceStatistics);

  // Local states
  const [updateMsg, setUpdatingMsg] = useState('');
  const [updateStatus, setUpdateStatus] = useState('idle');
  const isUpdateDone = useRef(false);
  const minsCount = useRef(0);

  useEffect(() => {
    if (updateStatus === 'start') {
      startUpdate();
    }
  }, [updateStatus]);

  const startUpdate = async () => {
    try {
      onUpdating(true);
      // fetch latest compatible version

      // compose the value to be written, eg. “v0.1.6.bin”
      const value = await fetchLatestSoftwareVersion();
      console.debug(`version value: ${value}`);

      // write to the wifi characteristic
      setUpdatingMsg(`Sending update command`);
      await connectAndDiscoverDevice(deviceId);
      const res = await startWiFiFirmwareUpdate(value, deviceId);

      setUpdatingMsg(`Update command sent`);
      await sleep(1000);

      // verify update result
      while (!isUpdateDone.current && minsCount.current < 5) {
        try {
          // disconnect
          cancelConnection(deviceId);

          // wait for 40s
          console.debug(`Wait...`);
          await sleep(40 * 1000);
          minsCount.current++;
          console.debug(`Waited for ${minsCount.current} mins`);

          const prevRebootCount = statsBefore?.reboot_counter || statsBefore?.r;
          const prevVersion = versionBefore?.sw;

          isUpdateDone.current = await checkUpdateResultOfKaiduScanner(deviceId, 3, prevRebootCount, prevVersion);
        } catch (err) {
          console.error('verifying update result: ' + err?.message);
        }
      }

      // console.debug(inspect(res));
      onUpdating(false);
      if (minsCount.current >= 5) {
        console.error('Firmware update failed. 5 mins passed');
        Alert.alert('Failed', 'Update was not  in 5 mins');
      } else if (isUpdateDone.current) {
        console.debug('Firmware update complete!');
        Alert.alert('Success', 'Firmware update complete!');
      } else {
        console.error('Firmware failed with error.');
        Alert.alert('Failed', 'Firmware failed some error');
      }
    } catch (err) {
      console.error(err.message);
      Alert.alert('Update Failed', err.message);
    } finally {
      return;
    }
  };

  const handlePress = () => {
    setUpdateStatus('start');
  };

  return (
    <>
      {isUpdating ? (
        <BaseUpdateMsg text={updateMsg}>
          <ChangingText text={'Updating firmware. Please wait for 1 to 3 mins'} />
        </BaseUpdateMsg>
      ) : (
        <Button title={title} onPress={handlePress} />
      )}
    </>
  );
}
