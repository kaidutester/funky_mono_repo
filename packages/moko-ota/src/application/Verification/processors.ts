export function createFirmwareNameStateText(fetchFirmwareFileNameState): string {
  const { loading, error, value } = fetchFirmwareFileNameState;

  if (loading) {
    return 'Loading latest firmware file name...';
  } else if (error) {
    return 'Failed to fetch latest firmware file name';
  } else if (value) {
    return `Latest Firmware file name: ${value}`;
  } else if (value === '') {
    return 'Latest Firmware file name is empty';
  }
}

export function createFirmwareFileStateText(checkFileState): string {
  const { loading, error, value } = checkFileState;

  if (loading) {
    return 'Loading firmware file...';
  } else if (error) {
    return 'Failed to fetch firmware file';
  } else if (value) {
    return 'Firmware file is ready';
  } else if (value === false) {
    return 'Firmware file is not ready';
  }
}

export function createMQTTStateText(mqttState): string {
  // mqttState === 'connected' ? 'MQTT server is connected' : 'MQTT server is not connected';
  if (mqttState === 'connected') {
    return 'MQTT server is connectable';
  } else if (mqttState === 'idle') {
    return ''; // unchecked
  } else if (mqttState === 'error') {
    return 'MQTT server connection get some error';
  } else {
    return 'connecting to MQTT server';
  }
}