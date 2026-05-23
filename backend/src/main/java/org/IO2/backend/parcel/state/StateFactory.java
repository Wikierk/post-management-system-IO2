package org.IO2.backend.parcel.state;

import org.IO2.backend.parcel.model.ParcelStatus;

public class StateFactory {
    public static ParcelState getState(ParcelStatus status) {
        return switch (status) {
            case CREATED -> new CreatedState();
            case PAID -> new PaidState();
            case IN_SORTING -> new InSortingState();
            case OUT_FOR_DELIVERY -> new OutForDeliveryState();
            default -> throw new IllegalStateException("Osiągnięto stan końcowy lub nieznany: " + status);
        };
    }
}
