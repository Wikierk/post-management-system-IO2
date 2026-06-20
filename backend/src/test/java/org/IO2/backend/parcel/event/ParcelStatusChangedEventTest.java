package org.IO2.backend.parcel.event;

import org.IO2.backend.parcel.model.ParcelStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ParcelStatusChangedEventTest {

    @Test
    void shouldExposeConstructorArguments() {
        ParcelStatusChangedEvent event = new ParcelStatusChangedEvent(
                this,
                "TRACK-001",
                "recipient@example.com",
                ParcelStatus.OUT_FOR_DELIVERY
        );

        assertEquals("TRACK-001", event.getTrackingNumber());
        assertEquals("recipient@example.com", event.getReceiverEmail());
        assertEquals(ParcelStatus.OUT_FOR_DELIVERY, event.getNewStatus());
    }
}

