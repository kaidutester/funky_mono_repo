package com.kaidu.mokoota;

import com.moko.support.callback.MokoScanDeviceCallback;
import com.moko.support.entity.DeviceInfo;

import java.util.HashMap;

public class MyMokoScanDeviceCallback implements MokoScanDeviceCallback {
    private HashMap<String, DeviceInfo> mDeviceMap;
    public MyMokoScanDeviceCallback() {
        super();
        this.mDeviceMap = new HashMap<>();
    }

    @Override
    public void onStartScan() {

    }

    @Override
    public void onScanDevice(DeviceInfo deviceInfo) {
        this.mDeviceMap.put(deviceInfo.mac, deviceInfo);
    }

    @Override
    public void onStopScan() {

    }

    public HashMap getDeviceMap() {
        return this.mDeviceMap;
    }

    public void clearScanned() {
        this.mDeviceMap.clear();
    }
}
