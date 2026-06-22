package org.IO2.backend.parcel.state;

import org.IO2.backend.parcel.model.ParcelStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;

class StateFactoryTest {

    @Test
    void shouldReturnCreatedStateForCreatedStatus() {
        assertInstanceOf(CreatedState.class, StateFactory.getState(ParcelStatus.CREATED));
    }

    @Test
    void shouldReturnPaidStateForPaidStatus() {
        assertInstanceOf(PaidState.class, StateFactory.getState(ParcelStatus.PAID));
    }

    @Test
    void shouldReturnSortingStateForInSortingStatus() {
        assertInstanceOf(InSortingState.class, StateFactory.getState(ParcelStatus.IN_SORTING));
    }

    @Test
    void shouldReturnOutForDeliveryStateForOutForDeliveryStatus() {
        assertInstanceOf(OutForDeliveryState.class, StateFactory.getState(ParcelStatus.OUT_FOR_DELIVERY));
    }

    @Test
    void shouldReturnComplaintStateForInComplaintStatus() {
        assertInstanceOf(InComplaintState.class, StateFactory.getState(ParcelStatus.IN_COMPLAINT));
    }
}

