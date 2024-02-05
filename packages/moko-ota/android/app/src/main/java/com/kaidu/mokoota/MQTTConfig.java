package com.kaidu.mokoota;

import android.content.Context;
import android.text.TextUtils;

import java.io.Serializable;

public class MQTTConfig implements Serializable {
    public String host = "";
    public String port = "1883";
    public boolean cleanSession = true;
    public int connectMode;
    public int qos = 1;
    public int keepAlive = 60;
    public String clientId = "";
    public String uniqueId = "";
    public String username = "";
    public String password = "";
    public String caPath;
    public String clientKeyPath;
    public String clientCertPath;
    public String topicSubscribe;
    public String topicPublish;

    public boolean isError(Context context) {
        if (context == null) {
            return TextUtils.isEmpty(host)
                    || TextUtils.isEmpty(port)
                    || keepAlive == 0;
        } else {
            if (TextUtils.isEmpty(host)) {
                return true;
            }
            if (TextUtils.isEmpty(port)) {
                return true;
            }
            if (Integer.parseInt(port) > 65535) {
                return true;
            }
            if (keepAlive < 10 || keepAlive > 120) {
                return true;
            }
        }
        return false;
    }

    public void reset() {
        host = "";
        port = "1883";
        cleanSession = true;
        connectMode = 0;
        qos = 1;
        keepAlive = 60;
        clientId = "";
        uniqueId = "";
        username = "";
        password = "";
        caPath = "";
        clientKeyPath = "";
        clientCertPath = "";
        topicSubscribe = "";
        topicPublish = "";
    }
}
