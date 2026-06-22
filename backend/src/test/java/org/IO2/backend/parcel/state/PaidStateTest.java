package org.IO2.backend.parcel.state;

import org.IO2.backend.parcel.model.Parcel;
import org.IO2.backend.parcel.model.ParcelStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PaidStateTest {

    @Test
    void shouldMoveParcelForwardToInSorting() {
        Parcel parcel = new Parcel();
        parcel.setStatus(ParcelStatus.PAID);

        new PaidState().next(parcel);

        assertEquals(ParcelStatus.IN_SORTING, parcel.getStatus());
    }

    @Test
    void shouldMoveParcelBackToCreated() {
        Parcel parcel = new Parcel();
        parcel.setStatus(ParcelStatus.PAID);

        new PaidState().previous(parcel);

        assertEquals(ParcelStatus.CREATED, parcel.getStatus());
    }
}

