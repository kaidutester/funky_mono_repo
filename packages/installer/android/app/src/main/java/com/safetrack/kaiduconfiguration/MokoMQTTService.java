package com.safetrack.kaiduconfiguration;

import android.app.Service;
import android.content.ContextWrapper;
import android.content.Intent;
import android.os.Binder;
import android.os.IBinder;
import android.util.Log;

import com.moko.support.callback.ActionListener;
import com.moko.support.handler.MQTTMessageAssembler;
import com.moko.support.handler.MqttCallbackHandler;
import com.moko.support.log.LogModule;

import org.eclipse.paho.android.service.MqttAndroidClient;
import org.eclipse.paho.client.mqttv3.IMqttToken;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.Writer;


public class MokoMQTTService extends Service {
    private MqttAndroidClient mqttAndroidClient;
    private ContextWrapper context;
    private IBinder mBinder = new LocalBinder();

    public class LocalBinder extends Binder {
        public MokoMQTTService getService() {
            return MokoMQTTService.this;
        }
    }

    public MokoMQTTService(ContextWrapper context) {
        this.context = context;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return mBinder;
    }

    @Override
    public boolean onUnbind(Intent intent) {
        return super.onUnbind(intent);
    }

    public void publish(String topic, byte[] message, int qos) throws MqttException {
        if (this.isConnected()) {
            mqttAndroidClient.publish(topic, message, qos, false, null, new ActionListener(this.context, ActionListener.Action.PUBLISH));
        }
    }

    public void subscribe(String topic, int qos) throws MqttException {
        if (mqttAndroidClient != null&& mqttAndroidClient.isConnected()) {
            mqttAndroidClient.subscribe(topic, qos, null, new ActionListener(this.context, ActionListener.Action.SUBSCRIBE));
        }
    }

    public void unSubscribe(String topic) throws MqttException {
        if (mqttAndroidClient != null&& mqttAndroidClient.isConnected()) {
            mqttAndroidClient.unsubscribe(topic, null, new ActionListener(this.context, ActionListener.Action.UNSUBSCRIBE));
        }
    }

    public boolean isConnected() {
        if (this.mqttAndroidClient != null) {
            return this.mqttAndroidClient.isConnected();
        }
        return false;
    }

    public MqttAndroidClient createClient(String host, String port, String clientId, boolean tlsConnection) {
        String serverUri;
        if (tlsConnection) {
            serverUri = "ssl://" + host + ":" + port;
        } else {
            serverUri = "tcp://" + host + ":" + port;
        }

        this.mqttAndroidClient = new MqttAndroidClient(this.context, serverUri, clientId);
        mqttAndroidClient.setCallback(new MqttCallbackHandler(this.context));
        return this.mqttAndroidClient;
    }

    public IMqttToken connectMqttServer() {
        Log.d("MokoModule", "connectMqttServer called");
        MqttAndroidClient mqttAndroidClient = this.mqttAndroidClient;
        MqttConnectOptions connOpts = new MqttConnectOptions();
        boolean cleanSession = true;
        int keepAlive = 60;
        String username = "";
        String password = "";


        connOpts.setAutomaticReconnect(true);
        connOpts.setCleanSession(cleanSession);
        connOpts.setKeepAliveInterval(keepAlive);
        connOpts.setUserName(username);
        connOpts.setPassword(password.toCharArray());

        IMqttToken token;

        try {
            if (mqttAndroidClient != null && !mqttAndroidClient.isConnected()) {
                Log.d("MokoModule", "start MQTT server connect");
                token = mqttAndroidClient.connect(connOpts);
                return token;
            }
        } catch (MqttException e) {
            // 读取stacktrace信息
            Log.d("MokoModule", "Error occurs");
            final Writer result = new StringWriter();
            final PrintWriter printWriter = new PrintWriter(result);
            e.printStackTrace(printWriter);
            StringBuffer errorReport = new StringBuffer();
            errorReport.append(result.toString());
            LogModule.e(errorReport.toString());
            Log.d("MokoModule", errorReport.toString());
        }
        return null;
    }

    public void fetchFirmwareVersion(String clientId, String appTopic) {
        byte[] message = MQTTMessageAssembler.assembleReadFirmwareVersion(clientId);
        try {
            this.publish(appTopic, message, 1);
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }
}


