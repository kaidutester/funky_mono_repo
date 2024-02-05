package com.safetrack.kaiduconfiguration;

import android.text.TextUtils;
import android.util.Log;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.google.gson.Gson;
import com.google.gson.JsonParser;
import com.google.gson.JsonObject;
import com.moko.supportpro.MokoSupport;
import com.moko.supportpro.MQTTSupport;
import com.moko.supportpro.entity.OTAMasterParams;
import com.moko.supportpro.handler.MQTTMessageAssembler;
import com.moko.supportpro.OrderTaskAssembler;
import com.moko.support.log.LogModule;
import com.moko.supportpro.entity.MsgDeviceInfo;
import com.moko.supportpro.entity.OTAParams;
import com.moko.ble.lib.task.OrderTask;
import com.moko.supportpro.MQTTConstants;

import org.eclipse.paho.client.mqttv3.MqttException;

import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.List;

public class MokoProModule extends ReactContextBaseJavaModule {
  private static Gson gson = new Gson();
  private static JsonParser parser = new JsonParser();
  private ReactApplicationContext context;
  private final String mokoPassword = "Moko4321";

  private MQTTConfig mqttConfig;

  MokoProModule(ReactApplicationContext context) {
    super(context);
    this.context = context;
  }

  @NonNull
  @Override
  public String getName() {
    return "MokoProModule";
  }

  @ReactMethod
  public void init() {
    MokoSupport.getInstance().init(this.context);
    MQTTSupport.getInstance().init(this.context);
    if (!LogModule.getIsinited()) {
      LogModule.init(context);
    }
  }

  @ReactMethod
  public void sendMokoTaskOrders(String macAddress, String mqttConfig) {
    Log.d("MokoProModule", "called sendMokoTaskOrders");

//    String mokoPassword = "Moko4321";
    String host = "47.104.81.55";
    int port = 1883;
    int qos = 1;
    int connectMode = 0; // 0: tcp
    int keepAlive = 60;
    int cleanSession = 1;
    int ntpTimezone = -5;

    // changing variables
    JsonObject rootObj = parser.parse(mqttConfig).getAsJsonObject();

    String appClientId = rootObj.get("appClientId").getAsString();
    String deviceClientId = rootObj.get("deviceClientId").getAsString();
    String deviceId = rootObj.get("deviceId").getAsString();
    String topicPublish = rootObj.get("topicPublish").getAsString();
    String topicSubscribe = rootObj.get("topicSubscribe").getAsString();
    String wifiSSID = rootObj.get("wifiSSID").getAsString();
    String wifiPassword = rootObj.get("wifiPassword").getAsString();
    Log.d("MokoProModule", "appClientId: " + appClientId + ", deviceClientId: " + deviceClientId + ", deviceId: " + deviceId + ", topicPublish: " + topicPublish + ", topicSubscribe: " + topicSubscribe + ", wifiSSID: " + wifiSSID + ", wifiPassword: " + wifiPassword);

    MokoSupport mokoSupport = MokoSupport.getInstance();

    boolean isConnected = mokoSupport.isConnDevice(macAddress);
    Log.d("MokoProModule", "MokoProModule isConnDevice:" + isConnected);

    List<OrderTask> orderTasks = new ArrayList<>();
    orderTasks.add(OrderTaskAssembler.setPassword(this.mokoPassword));

    orderTasks.add(OrderTaskAssembler.getDeviceMac());
    orderTasks.add(OrderTaskAssembler.getDeviceName());
    orderTasks.add(OrderTaskAssembler.setMqttHost(host));
    orderTasks.add(OrderTaskAssembler.setMqttPort(port));
    orderTasks.add(OrderTaskAssembler.setMqttClientId(deviceClientId));
    orderTasks.add(OrderTaskAssembler.setMqttCleanSession(cleanSession));
    orderTasks.add(OrderTaskAssembler.setMqttQos(qos));
    orderTasks.add(OrderTaskAssembler.setMqttKeepAlive(keepAlive));

    orderTasks.add(OrderTaskAssembler.setWifiSSID(wifiSSID));
    orderTasks.add(OrderTaskAssembler.setWifiPassword(wifiPassword));

    orderTasks.add(OrderTaskAssembler.setMqttDeivceId(deviceId));
    orderTasks.add(OrderTaskAssembler.setMqttPublishTopic(topicPublish));
    orderTasks.add(OrderTaskAssembler.setMqttSubscribeTopic(topicSubscribe));
    orderTasks.add(OrderTaskAssembler.setMqttConnectMode(connectMode));
    orderTasks.add(OrderTaskAssembler.setNTPTimezone(ntpTimezone));

    Log.d("MokoProModule", "Assembled all orders");

    mokoSupport.sendOrder(orderTasks.toArray(new OrderTask[] {}));
    Log.d("MokoProModule", "send order");
  }

  @ReactMethod
  public void sendExitConfigModeOrder() {
    OrderTask task = OrderTaskAssembler.exitConfigMode();
    MokoSupport.getInstance().sendOrder(task);
    Log.d("MokoProModule", "sendExitConfigModeOrder finished");
  }

  @ReactMethod
  public void connectBLE(String macAddress) {
    MokoSupport.getInstance().connDevice(macAddress);
    Log.d("MokoProModule", "called connDevice");
  }

  @ReactMethod
  public void connectMqtt(String mqttAppConfigStr) {
    try
    {
      MQTTSupport.getInstance().connectMqtt(mqttAppConfigStr);
    }
    catch (FileNotFoundException ex)  
    {
      Log.d("MokoProModule", "MQTTSupport connectMqtt got FileNotFoundException");
    }
  }

  @ReactMethod
  public void startUpdate(String host, int port, String catalogue, String deviceId, String appTopic, String mac, String deviceType) {

    // App should be connected to MQTT
    if (!MQTTSupport.getInstance().isConnected()) {
      Log.d("MokoProModule", "MQTTSupport is not connected");
      return;
    }

    // Device should be connected to MQTT
    Log.d("MokoProModule", "called startUpdate");

    // should timeout after 50s
    if (deviceType.equals("MokoMini01")) {
      setOTA(host, port, catalogue, deviceId, appTopic, mac);
    } else if (deviceType.equals("MokoMini02")) {
      setOTAMaster(host, port, catalogue, deviceId, appTopic, mac);
    }
  }

  // publish OTA message to MQTT server
  private void setOTA(String host, int port, String catalogue, String deviceId, String appTopic, String mac) {
    Log.d("MokoProModule", "called setOTA with deviceId: " + deviceId + "appTopic: " + appTopic + "mac: " + mac);

    int qos = 1;

    MsgDeviceInfo deviceInfo = new MsgDeviceInfo();
    deviceInfo.device_id = deviceId;
    deviceInfo.mac = mac;
    OTAParams params = new OTAParams();
    params.file_type = 0; // i.e. firmware
    params.domain_name = host;
    params.port = port;
    params.file_way = catalogue;
    String message = MQTTMessageAssembler.assembleWriteOTA(deviceInfo, params);
    Log.d("MokoProModule", "MQTTConstants.CONFIG_MSG_ID_OTA: " + MQTTConstants.CONFIG_MSG_ID_OTA);
    Log.d("MokoProModule", "published message: " + message);

    // publish OTA message/command to MQTT server
    try {
       MQTTSupport.getInstance().publish(appTopic, message, MQTTConstants.CONFIG_MSG_ID_OTA, qos);
    } catch (MqttException e) {
      Log.d("MokoProModule", "MqttException: " + e.getMessage());
    }
  }

  private void setOTAMaster(String host, int port, String catalogue, String deviceId, String appTopic, String mac) {
    int qos = 1;

    MsgDeviceInfo deviceInfo = new MsgDeviceInfo();
    deviceInfo.device_id = deviceId;
    deviceInfo.mac = mac;
    OTAMasterParams params = new OTAMasterParams();
    params.host = host;
    params.port = port;
    params.firmware_way = catalogue;
    String message = com.moko.supportpro.handler.MQTTMessageAssembler.assembleWriteOTAMaster(deviceInfo, params);
    try {
      MQTTSupport.getInstance().publish(appTopic, message, MQTTConstants.CONFIG_MSG_ID_OTA_MASTER, qos);
    } catch (MqttException e) {
      e.printStackTrace();
    }
  }

  @ReactMethod
  public void isAppConnectedToMQTT() {
    boolean isConnected = MQTTSupport.getInstance().isConnected();
    Log.d("MokoProModule", "Is App Connected To MQTT: " + isConnected);
  }
}
