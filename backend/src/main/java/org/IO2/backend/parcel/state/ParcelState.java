package org.IO2.backend.parcel.state;


import org.IO2.backend.parcel.model.Parcel;

public interface ParcelState {
    void next(Parcel parcel);
    void previous(Parcel parcel);
    void printStatus();
}

