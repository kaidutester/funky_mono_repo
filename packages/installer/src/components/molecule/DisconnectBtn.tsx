import React from 'react';
import Button from '../atomic/Button';
import { disconnectConnectedDeviceThunk } from '@kaidu/shared/providers/ble-devices';
import { useDispatch } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import Snackbar from 'react-native-snackbar';
import { tailwind } from '@kaidu/shared/lib/styles';
import { cancelConnection } from '@kaidu/shared/features/ble-general';

export function DisconnectBtn({deviceId, ...optionals}) {
  const { onDisconnected, children, ...rest } = optionals;
  const dispatch = useDispatch();

  const handlePress = async () => {
    // disconnect devices
    // execute disconnect, remove this from connectedDevice global state
    console.debug(`deviceId in disconnect btn: ${deviceId}`);
    try {
      await cancelConnection(deviceId);
      const resultAction = await dispatch(disconnectConnectedDeviceThunk(deviceId));
      const originalPromiseResult = unwrapResult(resultAction);
      console.debug(`originalPromiseResult: ${originalPromiseResult}`);

      if (originalPromiseResult && deviceId) {
        Snackbar.show({
          text: `Disconnected from ${deviceId}`,
          duration: Snackbar.LENGTH_LONG,
        });
      }
      //execute disconnect callback
      onDisconnected && onDisconnected(deviceId);
    } catch (error) {
      console.error(error.message);
      Snackbar.show({
        text: `Failed to disconnect. Please retry or close this App`,
        duration: Snackbar.LENGTH_LONG,
      });
    }
  };

  return <Button onPress={handlePress} title="Disconnect" style={tailwind('flex-row')} {...rest}>{children}</Button>;
}
