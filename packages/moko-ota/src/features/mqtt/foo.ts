import MQTT, { IMqttClient }  from 'sp-react-native-mqtt'; //https://www.npmjs.com/package/sp-react-native-mqtt, https://github.com/SudoPlz/sp-react-native-mqtt

// Create a client instance
// const client = new Paho.MQTT.Client(location.hostname, Number(location.port), "clientId");

/**
 * 
 */
export async function createMQTTClient(hostname: string, port: string | number, clientID: string): Promise<IMqttClient> {
  console.log("create MQTT Client:", hostname, port, clientID);
  // return new PahoMQTT.Client(hostname, Number(port), clientID);
  return MQTT.createClient({
    uri: `mqtt://${hostname}:${port}`,
    clientId: clientID,
    tls: false,
    keepalive: 60,
  });
}