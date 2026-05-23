package org.IO2.backend.parcel.state;

import org.IO2.backend.parcel.model.Parcel;
import org.IO2.backend.parcel.model.ParcelStatus;

public class OutForDeliveryState implements ParcelState {
    @Override
    public void next(Parcel parcel) {
        parcel.setStatus(ParcelStatus.DELIVERED);
    }
    @Override
    public void previous(Parcel parcel) {
        parcel.setStatus(ParcelStatus.IN_SORTING);
    }
    @Override
    public void printStatus() { System.out.println("Wydana do doręczenia"); }
}

