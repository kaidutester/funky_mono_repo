package com.safetrack.kaiduconfiguration;

import android.util.Log;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.google.gson.Gson;
import com.moko.support.MokoConstants;
import com.moko.support.MokoSupport;
import com.moko.support.event.ConnectStatusEvent;
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
    public void setMqttConfigToBeWritten(String host, String port, String clientId, String deviceId, String appPublish, String appSubscribe, String wifissid, String wifipassword) {
        Log.d("MokoModule", "set MqttConfig in app...");
        mqttConfig.host = host;
        mqttConfig.port = port;
        mqttConfig.cleanSession = true;
        mqttConfig.connectMode = 0; //tcp
        mqttConfig.qos = 1;
        mqttConfig.keepAlive = 60;
        mqttConfig.clientId = clientId;
        mqttConfig.uniqueId = deviceId;
        mqttConfig.username = "";
        mqttConfig.password = "";
        //capath, ...
        //public String caPath;
        //public String clientKeyPath;
        //public String clientCertPath;
        mqttConfig.topicPublish = appPublish;
        mqttConfig.topicSubscribe = appSubscribe;

        SetDeviceMqtt test = new SetDeviceMqtt(this.context, this.mqttConfig, wifissid, wifipassword, this.bleService);
        test.registerBroadcastReceiver();
        Log.d("MokoModule", "MqttConfig in app is set");
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
        MokoSupport.getInstance().disConnectBle();
    }

    @Subscribe(threadMode = ThreadMode.MAIN)
    public void onConnectStatusEvent(ConnectStatusEvent event) {
        String action = event.getAction();
        if (MokoConstants.ACTION_CONN_STATUS_DISCONNECTED.equals(action)) {
            // 设备断开
            Log.d("MokoModule", "Device disconnected");
        }
        if (MokoConstants.ACTION_DISCOVER_SUCCESS.equals(action)) {
            // 设备连接成功
            Log.d("MokoModule", "onConnectStatusEvent: BLE Connection success");
            // TimeUnit.SECONDS.sleep(1);
            this.setDeviceMQTTSetting();
        }
    }

    //triggered when the device is connected to the app via BLE
    public void setDeviceMQTTSetting() {
        Log.d("MokoModule", "setMQTT called");

        //MQTT
        this.mokoSupport.sendOrder(this.bleService.setHostSum(this.mqttConfig.host));

        // other settings will be triggered one by one
        Log.d("MokoModule", "setMQTT function finished");
    }

    @ReactMethod
    public void setWifiToBeWritten(String ssid, String password) {
        this.wifissid = ssid;
        this.wifipassword = password;
    }

    @ReactMethod
    // connect to MQTT server and update firmware
    // devSubscribe: the Subscribe topic of device
    public void updateFirmware(String mqttServerHost, String mqttServerPort, String firmwarehost, String firmwareport, String firmwarefilepath, String deviceId, String appClientId, String devSubscribe, String devPublish) {
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

                        String msg = "startupdate: host-" + firmwarehost + " port-" + firmwareport + " file path-" + firmwarefilepath;
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

        } catch (Exception e) {
            // 读取stacktrace信息
            final Writer result = new StringWriter();
            final PrintWriter printWriter = new PrintWriter(result);
            e.printStackTrace(printWriter);
            StringBuffer errorReport = new StringBuffer();
            errorReport.append(result.toString());
            LogModule.e(errorReport.toString());
            Log.d("MokoModule", errorReport.toString());
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
    public void isMQTTConnected(Callback callback) {
        callback.invoke(this.mokoMQTTService.isConnected());
    }

    @ReactMethod
    public void isBLEDeviceConnected(String mac, Callback callback) {
        callback.invoke(this.mokoSupport.isConnDevice(this.context, mac));
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
