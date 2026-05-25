package org.IO2.backend.parcel.state;

import org.IO2.backend.parcel.model.Parcel;

public class InComplaintState implements ParcelState {
    @Override
    public void next(Parcel parcel) {
        throw new IllegalStateException("Paczka jest w trakcie reklamacji! Zmiana statusu zablokowana.");
    }
    @Override
    public void previous(Parcel parcel) {
        throw new IllegalStateException("Paczka jest w trakcie reklamacji! Zmiana statusu zablokowana.");
    }
    @Override
    public void printStatus() { System.out.println("Reklamowana"); }
}

