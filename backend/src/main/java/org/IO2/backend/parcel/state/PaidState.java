package org.IO2.backend.parcel.state;

import org.IO2.backend.parcel.model.Parcel;
import org.IO2.backend.parcel.model.ParcelStatus;

public class PaidState implements ParcelState {
    @Override
    public void next(Parcel parcel) {
        parcel.setStatus(ParcelStatus.IN_SORTING);
    }
    @Override
    public void previous(Parcel parcel) {
        parcel.setStatus(ParcelStatus.CREATED);
    }
    @Override
    public void printStatus() { System.out.println("Opłacona"); }
}
