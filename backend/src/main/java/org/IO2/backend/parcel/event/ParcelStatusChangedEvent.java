package org.IO2.backend.parcel.event;

import lombok.Getter;
import org.IO2.backend.parcel.model.ParcelStatus;
import org.springframework.context.ApplicationEvent;

@Getter
public class ParcelStatusChangedEvent extends ApplicationEvent {
    private final String trackingNumber;
    private final String receiverEmail;
    private final ParcelStatus newStatus;

    public ParcelStatusChangedEvent(Object source, String trackingNumber, String receiverEmail, ParcelStatus newStatus) {
        super(source);
        this.trackingNumber = trackingNumber;
        this.receiverEmail = receiverEmail;
        this.newStatus = newStatus;
    }
}