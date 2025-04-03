package com.example.backendbtII.entities;

public class Airport {
    public String getIataCode() {
        return iataCode;
    }

    public void setIataCode(String iataCode) {
        this.iataCode = iataCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    private String iataCode;
    private String name;
    private String state;

    public Airport(String iataCode, String name, String state) {
        this.iataCode= iataCode;
        this.name= name;
        this.state = state;
    }

}
