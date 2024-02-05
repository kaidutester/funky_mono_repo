package com.safetrack.kaiduconfiguration;

import android.bluetooth.BluetoothAdapter;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.text.TextUtils;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.moko.support.MokoConstants;
import com.moko.support.MokoSupport;
import com.moko.support.entity.OrderEnum;
import com.moko.support.entity.OrderTaskResponse;

import org.greenrobot.eventbus.EventBus;

import java.io.File;
import java.io.FileInputStream;
import java.util.Arrays;

public class SetDeviceMqtt {
    private boolean mReceiverTag = false;
    private MQTTConfig mqttConfig;
    private String mWifiSSID;
    private String mWifiPassword;
    private boolean isSettingSuccess;
    private boolean isDeviceConnectSuccess;
    private ReactApplicationContext context;
    private MokoBlueService mMokoService;
    private File mFile;
    private BroadcastReceiver mReceiver;
    private WritableMap params;

    SetDeviceMqtt(ReactApplicationContext context, MQTTConfig mqttCon, String ssid, String pw,
            MokoBlueService mokoService) {
        this.mqttConfig = mqttCon;
        this.mWifiSSID = ssid;
        this.mWifiPassword = pw;
        this.context = context;
        this.mMokoService = mokoService;
        this.params = Arguments.createMap();
        setMokoReceiver();
    }

    public ReactContext getContext() {
        return this.context;
    }

    private ServiceConnection mServiceConnection = new ServiceConnection() {

        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            mMokoService = ((MokoBlueService.LocalBinder) service).getService();
            Log.d("MokoModule", "Broadcast receiver mReceiver start register onServiceConnected");
            // 注册广播接收器
            IntentFilter filter = new IntentFilter();
            filter.addAction(MokoConstants.ACTION_ORDER_RESULT);
            filter.addAction(MokoConstants.ACTION_ORDER_TIMEOUT);
            filter.addAction(MokoConstants.ACTION_ORDER_FINISH);
            filter.addAction(BluetoothAdapter.ACTION_STATE_CHANGED);
            filter.addAction(MokoConstants.ACTION_MQTT_RECEIVE);
            filter.setPriority(100);
            context.registerReceiver(mReceiver, filter);
            // Log.d("MokoModule", "Broadcast receiver mReceiver registered onServiceConnected");
            mReceiverTag = true;
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
        }
    };

    private void syncError() {
        Log.d("MokoModule", "syncError: order timeout");
        params.putString("orderError", "timeout");
        getContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onOrderTask", params);
    }

    public BroadcastReceiver getMokoReceiver() {
        return this.mReceiver;
    }

    public void setMokoReceiver() {
        MQTTConfig mqttConfig = this.mqttConfig;
        String mWifiSSID = this.mWifiSSID;
        String mWifiPassword = this.mWifiPassword;
        ReactContext reactContext = this.context;

        this.mReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent != null) {
                    String action = intent.getAction();
                    // Log.d("MokoModule", "Receive some action");
                    if (MokoConstants.ACTION_ORDER_TIMEOUT.equals(action)) {
                        Log.d("MokoModule", "ACTION_ORDER_TIMEOUT: sync error order timeout");
                        params.putString("orderError", "timeout");
                        getContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("onOrderTask", params);

                        OrderTaskResponse response = (OrderTaskResponse) intent
                                .getSerializableExtra(MokoConstants.EXTRA_KEY_RESPONSE_ORDER_TASK);
                        OrderEnum order = response.order;
                        switch (order) {

                        }
                    }
                    if (MokoConstants.ACTION_ORDER_FINISH.equals(action)) {
                        Log.d("MokoModule", "Action order finished");
                    }
                    if (MokoConstants.ACTION_ORDER_RESULT.equals(action)) {
                        Log.d("MokoModule", "BroadcastReceiver receive a result");
                        OrderTaskResponse response = (OrderTaskResponse) intent
                                .getSerializableExtra(MokoConstants.EXTRA_KEY_RESPONSE_ORDER_TASK);
                        OrderEnum order = response.order;
                        switch (order) {
                            case WRITE_HOST_PACKAGE_SUM:
                                Log.d("MokoModule", "Get response from writing host package sum");
                                MokoSupport.getInstance().sendOrder(mMokoService.setHost(mqttConfig.host));
                                break;
                            case WRITE_HOST:
                                Log.d("MokoModule", "Get response from writing host");
                                MokoSupport.getInstance()
                                        .sendOrder(mMokoService.setPort(Integer.parseInt(mqttConfig.port)));
                                break;
                            case WRITE_PORT:
                                Log.d("MokoModule", "Get response from writing port");
                                MokoSupport.getInstance()
                                        .sendOrder(mMokoService.setSession(mqttConfig.cleanSession ? 1 : 0));
                                break;
                            case WRITE_SESSION:
                                MokoSupport.getInstance().sendOrder(mMokoService.setDeviceIdSum(mqttConfig.uniqueId));
                                break;
                            case WRITE_DEVICE_ID_PACKAGE_SUM:
                                MokoSupport.getInstance().sendOrder(mMokoService.setDeviceId(mqttConfig.uniqueId));
                                break;
                            case WRITE_DEVICE_ID:
                                MokoSupport.getInstance().sendOrder(mMokoService.setClientIdSum(mqttConfig.clientId));
                                break;
                            case WRITE_CLIENT_ID_PACKAGE_SUM:
                                MokoSupport.getInstance().sendOrder(mMokoService.setClientId(mqttConfig.clientId));
                                break;
                            case WRITE_CLIENT_ID:
                                if (!TextUtils.isEmpty(mqttConfig.username)) {
                                    MokoSupport.getInstance()
                                            .sendOrder(mMokoService.setUsernameSum(mqttConfig.username));
                                } else if (!TextUtils.isEmpty(mqttConfig.password)) {
                                    MokoSupport.getInstance()
                                            .sendOrder(mMokoService.setPasswordSum(mqttConfig.password));
                                } else {
                                    MokoSupport.getInstance()
                                            .sendOrder(mMokoService.setKeepAlive(mqttConfig.keepAlive));
                                }
                                break;
                            case WRITE_USERNAME_PACKAGE_SUM:
                                MokoSupport.getInstance().sendOrder(mMokoService.setUsername(mqttConfig.username));
                                break;
                            case WRITE_USERNAME:
                                if (!TextUtils.isEmpty(mqttConfig.password)) {
                                    MokoSupport.getInstance()
                                            .sendOrder(mMokoService.setPasswordSum(mqttConfig.password));
                                } else {
                                    MokoSupport.getInstance()
                                            .sendOrder(mMokoService.setKeepAlive(mqttConfig.keepAlive));
                                }
                                break;
                            case WRITE_PASSWORD_PACKAGE_SUM:
                                MokoSupport.getInstance().sendOrder(mMokoService.setPassword(mqttConfig.password));
                                break;
                            case WRITE_PASSWORD:
                                MokoSupport.getInstance().sendOrder(mMokoService.setKeepAlive(mqttConfig.keepAlive));
                                break;
                            case WRITE_KEEPALIVE:
                                MokoSupport.getInstance().sendOrder(mMokoService.setQos(mqttConfig.qos));
                                break;
                            case WRITE_QOS:
                                MokoSupport.getInstance().sendOrder(mMokoService
                                        .setConnectMode(mqttConfig.connectMode == 3 ? 2 : mqttConfig.connectMode));
                                break;
                            case WRITE_CONNECTMODE:
                                if (mqttConfig.connectMode == 0
                                        || (mqttConfig.connectMode > 0 && TextUtils.isEmpty(mqttConfig.caPath))) {
                                    MokoSupport.getInstance()
                                            .sendOrder(mMokoService.setPublishSum(mqttConfig.topicPublish));
                                } else {
                                    // ssl
                                    mFile = new File(mqttConfig.caPath);
                                    MokoSupport.getInstance().sendOrder(mMokoService.setCASum((int) mFile.length()));
                                }
                                break;
                            case WRITE_CA_PACKAGE_SUM:
                                if (mFile != null && mFile.exists()) {
                                    try {
                                        FileInputStream inputSteam = new FileInputStream(mFile);
                                        byte[] buffer = new byte[(int) mFile.length()];
                                        inputSteam.read(buffer);
                                        MokoSupport.getInstance().sendOrder(mMokoService.setCA(buffer));
                                    } catch (Exception e) {
                                        e.printStackTrace();
                                        syncError();
                                    }
                                } else {
                                    syncError();
                                }
                                break;
                            case WRITE_CA:
                                if (mqttConfig.connectMode > 1) {
                                    // 双向验证
                                    mFile = new File(mqttConfig.clientCertPath);
                                    MokoSupport.getInstance()
                                            .sendOrder(mMokoService.setClientCertSum((int) mFile.length()));
                                } else {
                                    MokoSupport.getInstance()
                                            .sendOrder(mMokoService.setPublishSum(mqttConfig.topicPublish));
                                }
                                break;
                            case WRITE_CLIENTCERT_PACKAGE_SUM:
                                if (mFile != null && mFile.exists()) {
                                    try {
                                        FileInputStream inputSteam = new FileInputStream(mFile);
                                        byte[] buffer = new byte[(int) mFile.length()];
                                        inputSteam.read(buffer);
                                        MokoSupport.getInstance().sendOrder(mMokoService.setClientCert(buffer));
                                    } catch (Exception e) {
                                        e.printStackTrace();
                                        syncError();
                                    }
                                } else {
                                    syncError();
                                }
                                break;
                            case WRITE_CLIENTCERT:
                                mFile = new File(mqttConfig.clientKeyPath);
                                MokoSupport.getInstance()
                                        .sendOrder(mMokoService.setClientPrivateSum((int) mFile.length()));
                                break;
                            case WRITE_CLIENTPRIVATE_PACKAGE_SUM:
                                if (mFile != null && mFile.exists()) {
                                    try {
                                        FileInputStream inputSteam = new FileInputStream(mFile);
                                        byte[] buffer = new byte[(int) mFile.length()];
                                        inputSteam.read(buffer);
                                        MokoSupport.getInstance().sendOrder(mMokoService.setClientPrivate(buffer));
                                    } catch (Exception e) {
                                        e.printStackTrace();
                                        syncError();
                                    }
                                } else {
                                    syncError();
                                }
                                break;
                            case WRITE_CLIENTPRIVATE:
                                MokoSupport.getInstance()
                                        .sendOrder(mMokoService.setPublishSum(mqttConfig.topicPublish));
                                break;
                            case WRITE_PUBLISH_PACKAGE_SUM:
                                MokoSupport.getInstance().sendOrder(mMokoService.setPublish(mqttConfig.topicPublish));
                                break;
                            case WRITE_PUBLISH:
                                MokoSupport.getInstance()
                                        .sendOrder(mMokoService.setSubscribeSum(mqttConfig.topicSubscribe));
                                break;
                            case WRITE_SUBSCRIBE_PACKAGE_SUM:
                                MokoSupport.getInstance()
                                        .sendOrder(mMokoService.setSubscribe(mqttConfig.topicSubscribe));
                                break;
                            case WRITE_SUBSCRIBE:
                                MokoSupport.getInstance().sendOrder(mMokoService.setStaNameSum(mWifiSSID));
                                break;
                            case WRITE_STA_NAME_PACKAGE_SUM:
                                MokoSupport.getInstance().sendOrder(mMokoService.setStaName(mWifiSSID));
                                break;
                            case WRITE_STA_NAME:
                                Log.d("MokoModule", "sendOrder(mMokoService.setStaPasswordSum(mWifiPassword))");
                                MokoSupport.getInstance().sendOrder(mMokoService.setStaPasswordSum(mWifiPassword));
                                break;
                            case WRITE_STA_PASSWORD_PACKAGE_SUM:
                                Log.d("MokoModule", "sendOrder(mMokoService.setStaPassword(mWifiPassword))");
                                Log.d("MokoModule", "password:" + mWifiPassword);
                                MokoSupport.getInstance().sendOrder(mMokoService.setStaPassword(mWifiPassword));
                                break;
                            case WRITE_STA_PASSWORD:
                                Log.d("MokoModule", "sendOrder(mMokoService.setStartConnect()");
                                MokoSupport.getInstance().sendOrder(mMokoService.setStartConnect());
                                break;
                            case WRITE_START_CONNECT:
                                // 完成配置，断开蓝牙
                                mMokoService.disConnectBle();
                                Log.d("MokoModule", "Finished config, disconnect BLE");
                                WritableMap params = Arguments.createMap();
                                params.putString("mqttConfig", "done");
                                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                        .emit("onMQTTConfig", params);
                                break;
                        }
                    }
                    if (action.equals(MokoConstants.ACTION_MQTT_RECEIVE)) {
                        String topic = intent.getStringExtra(MokoConstants.EXTRA_MQTT_RECEIVE_TOPIC);
                        Log.d("MokoModule", "MQTT receive from SetDeviceMqtt: " + topic);
                        byte[] receive = intent.getByteArrayExtra(MokoConstants.EXTRA_MQTT_RECEIVE_MESSAGE);
                        if (TextUtils.isEmpty(topic) || isDeviceConnectSuccess) {
                            return;
                        }
                        int header = receive[0] & 0xFF;
                        if (header != 0x24) {
                            return;
                        }
                        int length = receive[1] & 0xFF;
                        byte[] id = Arrays.copyOfRange(receive, 2, 2 + length);
                        if (!mqttConfig.uniqueId.equals(new String(id))) {
                            return;
                        }
                    }
                    if (BluetoothAdapter.ACTION_STATE_CHANGED.equals(action)) {
                        int blueState = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, 0);
                        switch (blueState) {
                            case BluetoothAdapter.STATE_TURNING_OFF:
                                Log.d("MokoModule", "dismissConnMqttDialog");
                                break;
                        }
                    }
                }
            }
        };
    }

    public void registerBroadcastReceiver() {
        Log.d("MokoModule", "Broadcast receiver mReceiver start register");
        // 注册广播接收器
        IntentFilter filter = new IntentFilter();
        filter.addAction(MokoConstants.ACTION_ORDER_RESULT);
        filter.addAction(MokoConstants.ACTION_ORDER_TIMEOUT);
        filter.addAction(MokoConstants.ACTION_ORDER_FINISH);
        filter.addAction(BluetoothAdapter.ACTION_STATE_CHANGED);
        filter.addAction(MokoConstants.ACTION_MQTT_RECEIVE);
        filter.setPriority(100);
        this.context.registerReceiver(this.mReceiver, filter);
        Log.d("MokoModule", "Broadcast receiver mReceiver registered");
        mReceiverTag = true;
    }
}
