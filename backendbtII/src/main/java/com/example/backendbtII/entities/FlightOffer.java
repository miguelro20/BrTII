package com.example.backendbtII.entities;

public class FlightOffer {
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public boolean isInstantTicketingRequired() {
        return instantTicketingRequired;
    }

    public void setInstantTicketingRequired(boolean instantTicketingRequired) {
        this.instantTicketingRequired = instantTicketingRequired;
    }

    public String getLastTicketingDate() {
        return lastTicketingDate;
    }

    public void setLastTicketingDate(String lastTicketingDate) {
        this.lastTicketingDate = lastTicketingDate;
    }

    public boolean isNonHomogeneous() {
        return nonHomogeneous;
    }

    public void setNonHomogeneous(boolean nonHomogeneous) {
        this.nonHomogeneous = nonHomogeneous;
    }

    public boolean isPaymentCardRequired() {
        return paymentCardRequired;
    }

    public void setPaymentCardRequired(boolean paymentCardRequired) {
        this.paymentCardRequired = paymentCardRequired;
    }

    public int getNumberOfBookableSeats() {
        return numberOfBookableSeats;
    }

    public void setNumberOfBookableSeats(int numberOfBookableSeats) {
        this.numberOfBookableSeats = numberOfBookableSeats;
    }

    private String type;
    private String id;
    private String source;
    private boolean instantTicketingRequired;
    private String lastTicketingDate;
    private boolean nonHomogeneous;
    private boolean paymentCardRequired;
    private int numberOfBookableSeats;

    public FlightOffer() {}


}
