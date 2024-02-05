package com.moko.supportpro.event;

public class DeviceModifyNameEvent {

    private String deviceId;

    public DeviceModifyNameEvent(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getDeviceId() {
        return deviceId;
    }
}
