package org.IO2.backend.parcel.event;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Component;

@Component
@EnableAsync
public class NotificationListener {

    @Async
    @EventListener
    public void handleParcelStatusChanged(ParcelStatusChangedEvent event) {
        System.out.println("\n[ASYNC OBSERVER] ---> Wysyłanie powiadomienia EMAIL...");
        System.out.println("Do: " + event.getReceiverEmail());
        System.out.println("Treść: Twoja paczka " + event.getTrackingNumber() + " zmieniła status na: " + event.getNewStatus());
        System.out.println("[ASYNC OBSERVER] ---> Powiadomienie wysłane pomyślnie!\n");
    }
}

