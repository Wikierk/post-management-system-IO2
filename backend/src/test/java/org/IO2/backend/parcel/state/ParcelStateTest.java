package org.IO2.backend.parcel.state;

import org.IO2.backend.parcel.model.Parcel;
import org.IO2.backend.parcel.model.ParcelStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ParcelStateTest {

    @Test
    void shouldTransitionFromCreatedToPaid() {
        Parcel parcel = new Parcel();
        parcel.setStatus(ParcelStatus.CREATED);

        parcel.nextState();

        assertEquals(ParcelStatus.PAID, parcel.getStatus(), "Paczka powinna przejść w stan PAID");
    }

    @Test
    void shouldThrowExceptionWhenAdvancingFromInComplaint() {
        Parcel parcel = new Parcel();
        parcel.setStatus(ParcelStatus.IN_COMPLAINT);

        Exception exception = assertThrows(IllegalStateException.class, parcel::nextState);
        assertTrue(exception.getMessage().contains("reklamacji"), "Powinien pojawić się błąd o trwającej reklamacji");
    }
}
