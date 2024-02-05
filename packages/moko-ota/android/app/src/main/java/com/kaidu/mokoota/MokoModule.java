package com.kaidu.mokoota;

import android.util.Log;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.Promise;

import com.google.gson.Gson;
import com.moko.support.MokoConstants;
import com.moko.support.MokoSupport;
import com.moko.support.event.ConnectStatusEvent;
import com.moko.support.handler.MQTTMessageAssembler;
import com.moko.support.log.LogModule;

import org.eclipse.paho.client.mqttv3.IMqttActionListener;
import org.eclipse.paho.client.mqttv3.IMqttToken;
import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.Writer;
import java.util.HashMap;
import java.util.concurrent.TimeUnit;

import org.eclipse.paho.client.mqttv3.MqttException;


public class MokoModule extends ReactContextBaseJavaModule {
    private static Gson gson = new Gson();
    private MokoSupport mokoSupport;
    private MyMokoScanDeviceCallback mDeviceCallback;
    private ReactApplicationContext context;
    private MokoBlueService bleService;
    private MokoMQTTService mokoMQTTService;

    private String wifissid;
    private String wifipassword;
    private MQTTConfig mqttConfig;
    private FirmwareUpdater updater;

    MokoModule(ReactApplicationContext context) {
        super(context);
        this.mokoSupport = MokoSupport.getInstance();
        this.context = context;
        this.bleService = new MokoBlueService(context);
        this.mDeviceCallback = new MyMokoScanDeviceCallback();
        this.mqttConfig = new MQTTConfig();
        this.mokoMQTTService = new MokoMQTTService(context);
        this.updater = new FirmwareUpdater(context);
        EventBus.getDefault().register(this);
    }


    @NonNull
    @Override
    public String getName() {
        return "MokoModule";
    }

    @ReactMethod
    // each time a MQTT configuration is passed, receiver should be updated and re-registered
    public void setMqttConfigToBeWritten(String host, String port, String clientId, String deviceId, String appPublish, String appSubscribe, String wifissid, String wifipassword) {
        Log.d("MokoModule", "set MqttConfig in app, input appSubscribe: " + appSubscribe);

        // force method to use updated MQTT config values
        MQTTConfig nextMqttConfig = new MQTTConfig();
        nextMqttConfig.host = host;
        nextMqttConfig.port = port;
        nextMqttConfig.cleanSession = true;
        nextMqttConfig.connectMode = 0; //tcp
        nextMqttConfig.qos = 1;
        nextMqttConfig.keepAlive = 60;
        nextMqttConfig.clientId = clientId;
        nextMqttConfig.uniqueId = deviceId;
        nextMqttConfig.username = "";
        nextMqttConfig.password = "";
        //capath, ...
        //public String caPath;
        //public String clientKeyPath;
        //public String clientCertPath;
        nextMqttConfig.topicPublish = appPublish;
        nextMqttConfig.topicSubscribe = appSubscribe;

        this.mqttConfig = nextMqttConfig;


        SetDeviceMqtt deviceMQTTsetter = SetDeviceMqtt.getInstance(this.context, nextMqttConfig, wifissid, wifipassword, this.bleService);
        deviceMQTTsetter.unregisterBroadcastReceiver();
        deviceMQTTsetter.setMokoReceiver();
        deviceMQTTsetter.registerBroadcastReceiver();
        Log.d("MokoModule", "MqttConfig in app is set to topic");
    }

    @ReactMethod
    public void init() {
        this.mokoSupport.init(this.context);
        this.updater.registerBroadcast();
    }

    @ReactMethod
    public void scanDevices() {
        boolean isBluetoothOn = this.mokoSupport.isBluetoothOpen();
        Log.d("MokoModule", "isBluetoothOn: " + Boolean.toString(isBluetoothOn));
        this.mokoSupport.startScanDevice(this.mDeviceCallback);
    }

    @ReactMethod
    public void stopScanDevice() {
        this.mokoSupport.stopScanDevice();
    }

    @ReactMethod
    public void connectBLE(String mac, Callback callback) {
        Log.d("MokoModule", "connectBLE: start connect" + mac);
        this.mokoSupport.connDevice(this.context, mac, this.bleService);
        callback.invoke();
    }

    @ReactMethod
    public void disconnectBLE() {
        Log.d("MokoModule", "ReactMethod disconnectBLE");
        MokoSupport.getInstance().disConnectBle();
    }

    @Subscribe(sticky = true, threadMode = ThreadMode.MAIN)
    public void onConnectStatusEvent(ConnectStatusEvent event) throws InterruptedException {
        String action = event.getAction();
        if (MokoConstants.ACTION_CONN_STATUS_DISCONNECTED.equals(action)) {
            // 设备断开
            Log.d("MokoModule", "Device disconnected");
            this.emitMokoEvent("onBLEConnect", "isConnected", "false");
        }
        if (MokoConstants.ACTION_DISCOVER_SUCCESS.equals(action)) {
            // 设备连接成功
            Log.d("MokoModule", "onConnectStatusEvent: BLE Connection success");
            this.emitMokoEvent("onBLEConnect", "isConnected", "true");

            TimeUnit.SECONDS.sleep(1);
            this.setDeviceMQTTSetting();
        }
    }

    // triggered when the device is connected to the app via BLE
    public void setDeviceMQTTSetting() {
        Log.d("MokoModule", "setDeviceMQTTSetting called");
        //MQTT
        this.mokoSupport.sendOrder(this.bleService.setHostSum(this.mqttConfig.host));
        // other settings will be triggered one by one
        Log.d("MokoModule", "setDeviceMQTTSetting function finished");
    }

    @ReactMethod
    // connect to MQTT server and update firmware
    // devSubscribe: the Subscribe topic of device
    public void updateFirmware(String mqttServerHost, String mqttServerPort, String firmwarehost, String firmwareport, String firmwarefilepath, String deviceId, String appClientId, String devSubscribe, String devPublish, Promise promise) {
        try {
            FirmwareUpdater updater = this.updater;
            MokoMQTTService mokoMQTTService = this.mokoMQTTService;

            IMqttActionListener mqttConnectionCallback = new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {
                    // MQTT server connected
                    Log.d("MokoModule", "onSuccess: MQTT server connected");
                    try {
                        //subscribe to device publish topic
                        Log.d("MokoModule", "before subscribe");
                        mokoMQTTService.subscribe(devPublish, 1);

                        String msg = "startupdate: host: " + firmwarehost + " port: " + firmwareport + " file path: " + firmwarefilepath;
                        Log.d("MokoModule", msg);
                        updater.startUpdate(firmwarehost, firmwareport, firmwarefilepath, deviceId, devSubscribe, mokoMQTTService);
                    } catch (Exception e) {
                        Log.d("MokoModule", "onSuccess error: " + e.getMessage());
                    }
                }

                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    // Something went wrong e.g. connection timeout or firewall problems
                    Log.d("MokoModule", exception.toString());
                }
            };

            this.connectToMQTTServer(mqttServerHost, mqttServerPort, appClientId, mqttConnectionCallback);
            promise.resolve("updateFirmware finished");
        } catch (Exception e) {
            // 读取stacktrace信息
            final Writer result = new StringWriter();
            final PrintWriter printWriter = new PrintWriter(result);
            e.printStackTrace(printWriter);
            StringBuffer errorReport = new StringBuffer();
            errorReport.append(result.toString());
            LogModule.e(errorReport.toString());
            Log.d("MokoModule", errorReport.toString());

            promise.reject(errorReport.toString());
        }
    }


    @ReactMethod
    public void connectToMQTTServer(String host, String port, String appClientId, IMqttActionListener listener) {
        this.mokoMQTTService.createClient(host, port, appClientId, false);
        IMqttToken token = this.mokoMQTTService.connectMqttServer();
        token.setActionCallback(listener);

        Log.d("MokoModule", "connectToMQTTServer finished");
    }

    @ReactMethod
    public void checkDeviceMQTTConnection(String host, String port, String appClientId, String appToDeviceTopic, String deviceID, String deviceToAppTopic) throws InterruptedException, MqttException {

        // close existing connection if it exist
        IMqttToken disconnectToken = this.mokoMQTTService.disconnectMqttServer();
        if (disconnectToken != null) {
            try {
                disconnectToken.waitForCompletion();
                // Disconnect successful
            } catch (MqttException e) {
                // Disconnect failed
            }
        }

        // create client if it doesn't exist
        this.mokoMQTTService.getClient(host, port, appClientId, false);

        IMqttToken token = this.mokoMQTTService.connectMqttServer();

        IMqttActionListener mqttConnectionCallback = new IMqttActionListener() {
            @Override
            public void onSuccess(IMqttToken asyncActionToken) {
                // MQTT server connected
                Log.d("MokoModule", "checkDeviceMQTTConnection onSuccess: MQTT server connected");
                try {
                    //subscribe to device publish topic
                    Log.d("MokoModule", "mokoMQTTService subscribe topic" + deviceToAppTopic);
                    mokoMQTTService.subscribe(deviceToAppTopic, 1);
                    
                    // publish
                    byte[] messsage = MQTTMessageAssembler.assembleReadLEDStatus(deviceID);
                    int qos = 1;
                    Log.d("MokoModule", "publish to topic" + appToDeviceTopic);
                    mokoMQTTService.publish(appToDeviceTopic, messsage, qos);
                } catch (Exception e) {
                    Log.d("MokoModule", "checkDeviceMQTTConnection error: " + e.getMessage());
                }
            }

            @Override
            public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                // Something went wrong e.g. connection timeout or firewall problems
                Log.d("MokoModule", exception.toString());
            }
        };

        if (token != null) {
            token.setActionCallback(mqttConnectionCallback);
        }

        Log.d("MokoModule", "checkDeviceMQTTConnection finished");
    }

    @ReactMethod
    public void isMQTTConnected(Callback callback) {
        callback.invoke(this.mokoMQTTService.isConnected());
    }

    @ReactMethod
    public void isBLEDeviceConnected(String mac, Callback callback) {
        boolean isConnected = this.mokoSupport.isConnDevice(this.context, mac);
        callback.invoke(isConnected);
    }

    @ReactMethod
    public void emitMokoEvent(String eventName, String key, String message) {
        WritableMap params = Arguments.createMap();
        params.putString(key, message);
        this.context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }

    @ReactMethod
    public void test() {
        WritableMap params = Arguments.createMap();
        params.putString("result", "succeeded");
        this.context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onUpdate", params);
    }
}
