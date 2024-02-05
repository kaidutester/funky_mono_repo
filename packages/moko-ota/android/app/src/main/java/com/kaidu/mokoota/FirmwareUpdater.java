package com.kaidu.mokoota;

import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.ContextWrapper;
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
import com.moko.support.handler.MQTTMessageAssembler;

import org.eclipse.paho.client.mqttv3.MqttException;

import java.util.Arrays;


/**
 * @Description
 * @ClassPath com.kaidu.mokoota.FirmwareUpdater
 */
public class FirmwareUpdater {

    private ReactContext context;
    private String uniqueId; // uniqueId of the moko device
    private Callback resultCallback;


    public FirmwareUpdater(ReactApplicationContext context) {
        super();
//        mokoDevice = (MokoDevice) getIntent().getSerializableExtra(AppConstants.EXTRA_KEY_DEVICE);
        this.context = context;
    }

    public void setResultCallback(Callback fn) {
        this.resultCallback = fn;
    }

    public Callback getResultCallback() {
        return this.resultCallback;
    }

    public ReactContext getContext() {return this.context;}
    
    private static final char[] HEX_ARRAY = "0123456789ABCDEF".toCharArray();
    public static String bytesToHex(byte[] bytes) {
        char[] hexChars = new char[bytes.length * 2];
        for (int j = 0; j < bytes.length; j++) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = HEX_ARRAY[v >>> 4];
            hexChars[j * 2 + 1] = HEX_ARRAY[v & 0x0F];
        }
        return new String(hexChars);
    }

    private BroadcastReceiver mReceiver = new BroadcastReceiver() {

        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            //Callback resultCallback = getResultCallback();
            WritableMap params = Arguments.createMap();

//            Log.d("MokoModule", "FirmwareUpdater receiver receives: " + action);
            if (MokoConstants.ACTION_MQTT_CONNECTION.equals(action)) {
                int state = intent.getIntExtra(MokoConstants.EXTRA_MQTT_CONNECTION_STATE, 0);
//                Log.d("MokoModule", "Receiver gets: " + action);
            }
            if (MokoConstants.ACTION_MQTT_RECEIVE.equals(action)) {
                String topic = intent.getStringExtra(MokoConstants.EXTRA_MQTT_RECEIVE_TOPIC);
                Log.d("MokoModule", "MQTT receive: " + topic);
                try {
                    byte[] receive = intent.getByteArrayExtra(MokoConstants.EXTRA_MQTT_RECEIVE_MESSAGE);
                    int header = receive[0] & 0xFF;
                    if (header == 0x22)// OTA Update Result 升级结果
                    {
                        int length = receive[1] & 0xFF;
                        byte[] id = Arrays.copyOfRange(receive, 2, 2 + length);
                        Log.d("MokoModule", "Get 升级结果");
                        if (uniqueId.equals(new String(id))) {
                            if (receive[receive.length - 1] == 0) {
                                Log.d("MokoModule", "update firmware failed");
                                params.putString("result", "failed");
                                getContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onUpdate", params);

                                //String result = "failed";
                                //if (resultCallback != null) { resultCallback.invoke("failed");}
                            } else {
                                Log.d("MokoModule", "update firmware success");
                                params.putString("result", "succeeded");
                                getContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onUpdate", params);
                                //String result = "succeeded";
                                //if (resultCallback != null) { resultCallback.invoke("succeeded");}
                            }
                            params = Arguments.createMap();
                        }
                    } else {
                        // also emit "onMQTTSubscription" events
                        String receivedString = bytesToHex(receive);
                        WritableMap params1 = Arguments.createMap();
                        params1.putString("msg", receivedString);
                        getContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onMQTTSubscription", params1);
                    }
                } catch(Exception e) {
                    Log.d("MokoModule", "MQTT receive error: " + e.getMessage());
                }
            }
            if (MokoConstants.ACTION_MQTT_SUBSCRIBE.equals(action)) {
                int state = intent.getIntExtra(MokoConstants.EXTRA_MQTT_STATE, 0);
            }
            if (MokoConstants.ACTION_MQTT_UNSUBSCRIBE.equals(action)) {
                int state = intent.getIntExtra(MokoConstants.EXTRA_MQTT_STATE, 0);
            }
        }
    };

    public void registerBroadcast() {
        // 注册广播接收器
        IntentFilter filter = new IntentFilter();
        filter.addAction(MokoConstants.ACTION_MQTT_CONNECTION);
        filter.addAction(MokoConstants.ACTION_MQTT_RECEIVE);
        filter.addAction(MokoConstants.ACTION_MQTT_SUBSCRIBE);
        filter.addAction(MokoConstants.ACTION_MQTT_UNSUBSCRIBE);
        context.registerReceiver(mReceiver, filter);
    }

    private ServiceConnection serviceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            // 注册广播接收器
            IntentFilter filter = new IntentFilter();
            filter.addAction(MokoConstants.ACTION_MQTT_CONNECTION);
            filter.addAction(MokoConstants.ACTION_MQTT_RECEIVE);
            filter.addAction(MokoConstants.ACTION_MQTT_SUBSCRIBE);
            filter.addAction(MokoConstants.ACTION_MQTT_UNSUBSCRIBE);
            context.registerReceiver(mReceiver, filter);
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {

        }
    };


    public void startUpdate(String hostStr, String portStr, String catalogueStr, String deviceId, String appTopic, MokoMQTTService mokoMQTTService) {
        Log.d("MokoModule", "startUpdate called");
        this.uniqueId = deviceId;

        if (TextUtils.isEmpty(hostStr)) {
            Log.d("MokoModule", "MQTT Host cannot be empty");
            return;
        }
        if (!TextUtils.isEmpty(portStr) && Integer.parseInt(portStr) > 65535) {
            Log.d("MokoModule", "MQTT port cannot be empty");
            return;
        }
        if (TextUtils.isEmpty(catalogueStr)) {
            Log.d("MokoModule", "File path cannot be empty");
            return;
        }
        Log.d("MokoModule", "Updating firmware...");

        setOTAType(deviceId, appTopic, mokoMQTTService);
        Log.d("MokoModule", "setHostAndPort: host = " + hostStr + ", port = " + portStr);
        setHostAndPort(hostStr, Integer.parseInt(portStr), deviceId, appTopic, mokoMQTTService);
        Log.d("MokoModule", "setCatalogue: catalogue = " + catalogueStr);
        setCatalogue(catalogueStr, deviceId, appTopic, mokoMQTTService);
    }


    private void setOTAType(String uniqueId, String appTopic, MokoMQTTService mokoMQTTService) {
        Log.d("MokoModule", "setOTAType called");
        byte[] message = MQTTMessageAssembler.assembleWriteOTAType(uniqueId, 1);// 1 - firmware
        try {
            mokoMQTTService.publish(appTopic, message, 1);
            Log.d("MokoModule", "Publish setOTAType message");
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    private void setHostAndPort(String host, int port, String uniqueId, String appTopic, MokoMQTTService mokoMQTTService) {
        byte[] message = MQTTMessageAssembler.assembleWriteHostAndPort(uniqueId, host, port);
        try {
            mokoMQTTService.publish(appTopic, message, 1);
            Log.d("MokoModule", "Publish setHostAndPort message");
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    private void setCatalogue(String catalogue,  String uniqueId, String appTopic, MokoMQTTService mokoMQTTService) {
        byte[] message = MQTTMessageAssembler.assembleWriteCatalogue(uniqueId, catalogue);
        try {
            mokoMQTTService.publish(appTopic, message, 1);
            Log.d("MokoModule", "Publish setCatalogue message");
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }
}
