package com.moko.supportpro.entity;

import com.google.gson.annotations.SerializedName;

public class FilterUid {
    @SerializedName("switch")
    public int onOff;
    public String namespace;
    public String instance;
}
