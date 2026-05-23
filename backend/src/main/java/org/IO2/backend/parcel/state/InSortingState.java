package org.IO2.backend.parcel.state;

import org.IO2.backend.parcel.model.Parcel;
import org.IO2.backend.parcel.model.ParcelStatus;

public class InSortingState implements ParcelState {
    @Override
    public void next(Parcel parcel) {
        parcel.setStatus(ParcelStatus.OUT_FOR_DELIVERY);
    }
    @Override
    public void previous(Parcel parcel) {
        parcel.setStatus(ParcelStatus.PAID);
    }
    @Override
    public void printStatus() { System.out.println("W sortowni"); }
}
