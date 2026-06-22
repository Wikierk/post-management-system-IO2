package org.IO2.backend.parcel.event;

import org.IO2.backend.parcel.model.ParcelStatus;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.junit.jupiter.api.Assertions.assertTrue;

class NotificationListenerTest {

    @Test
    void shouldPrintNotificationMessage() {
        NotificationListener listener = new NotificationListener();
        ParcelStatusChangedEvent event = new ParcelStatusChangedEvent(
                this,
                "TRACK-002",
                "test@example.com",
                ParcelStatus.DELIVERED
        );

        PrintStream originalOut = System.out;
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        System.setOut(new PrintStream(output));

        try {
            listener.handleParcelStatusChanged(event);
        } finally {
            System.setOut(originalOut);
        }

        String printed = output.toString();
        assertTrue(printed.contains("Wysyłanie powiadomienia EMAIL"));
        assertTrue(printed.contains("test@example.com"));
        assertTrue(printed.contains("TRACK-002"));
        assertTrue(printed.contains("DELIVERED"));
    }
}

