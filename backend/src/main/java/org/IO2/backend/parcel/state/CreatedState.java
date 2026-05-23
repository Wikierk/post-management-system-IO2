package org.IO2.backend.parcel.state;


import org.IO2.backend.parcel.model.Parcel;
import org.IO2.backend.parcel.model.ParcelStatus;

public class CreatedState implements ParcelState {
    @Override
    public void next(Parcel parcel) {
        parcel.setStatus(ParcelStatus.PAID);
    }
    @Override
    public void previous(Parcel parcel) {
        System.out.println("Paczka jest w początkowym stanie.");
    }
    @Override
    public void printStatus() { System.out.println("Utworzona"); }
}
