package org.IO2.backend.parcel.service;

import org.IO2.backend.model.Pricing;
import org.IO2.backend.model.User;
import org.IO2.backend.parcel.event.ParcelStatusChangedEvent;
import org.IO2.backend.parcel.model.Parcel;
import org.IO2.backend.parcel.model.ParcelSize;
import org.IO2.backend.parcel.model.ParcelStatus;
import org.IO2.backend.parcel.repository.ParcelHistoryRepository;
import org.IO2.backend.parcel.repository.ParcelRepository;
import org.IO2.backend.parcel.repository.PricingRepository;
import org.IO2.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ParcelServiceTest {

    @Mock
    private ParcelRepository parcelRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PricingRepository pricingRepository;
    @Mock
    private ParcelHistoryRepository parcelHistoryRepository;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ParcelService parcelService;

    @Test
    void shouldCreateParcelSuccessfully() {
        String senderEmail = "test@test.pl";
        User mockUser = new User();
        mockUser.setEmail(senderEmail);

        Pricing mockPricing = Pricing.builder()
                .size(ParcelSize.SMALL)
                .basePrice(new BigDecimal("5.00"))
                .weightMultiplier(new BigDecimal("1.00"))
                .priorityAddon(BigDecimal.ZERO)
                .insuranceAddon(BigDecimal.ZERO)
                .build();

        Parcel requestParcel = new Parcel();
        requestParcel.setSize(ParcelSize.SMALL);
        requestParcel.setWeight(1.0);
        requestParcel.setIsPriority(false);
        requestParcel.setIsInsured(false);

        when(userRepository.findByEmail(senderEmail)).thenReturn(Optional.of(mockUser));
        when(pricingRepository.findBySize(ParcelSize.SMALL)).thenReturn(Optional.of(mockPricing));
        when(parcelRepository.save(any(Parcel.class))).thenAnswer(invocation -> invocation.getArgument(0));


        Parcel createdParcel = parcelService.createParcel(requestParcel, senderEmail);

        assertNotNull(createdParcel.getTrackingNumber(), "Numer trackingowy powinien zostać wygenerowany");
        assertEquals(ParcelStatus.CREATED, createdParcel.getStatus(), "Początkowy status to CREATED");
        assertEquals(0, new BigDecimal("6.00").compareTo(createdParcel.getPrice()), "Cena powinna wynosić 6.00");

        verify(parcelHistoryRepository, times(1)).save(any());
    }

    @Test
    void shouldAdvanceParcelStatusAndPublishEvent() {
        String trackingNumber = "TRACK123";
        String workerEmail = "worker@poczta.pl";

        Parcel mockParcel = new Parcel();
        mockParcel.setTrackingNumber(trackingNumber);
        mockParcel.setStatus(ParcelStatus.CREATED); // Stan początkowy

        User mockWorker = new User();
        mockWorker.setEmail(workerEmail);

        when(parcelRepository.findByTrackingNumber(trackingNumber)).thenReturn(Optional.of(mockParcel));
        when(userRepository.findByEmail(workerEmail)).thenReturn(Optional.of(mockWorker));
        when(parcelRepository.save(any(Parcel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Parcel advancedParcel = parcelService.advanceStatus(trackingNumber, workerEmail);


        assertEquals(ParcelStatus.PAID, advancedParcel.getStatus(), "Status powinien zmienić się na PAID");

        verify(parcelHistoryRepository, times(1)).save(any());
        verify(eventPublisher, times(1)).publishEvent(any(ParcelStatusChangedEvent.class));
    }

    @Test
    void shouldAssignCourierSuccessfully() {
        String trackingNumber = "TRACK123";
        String courierEmail = "courier@poczta.pl";

        Parcel mockParcel = new Parcel();
        mockParcel.setTrackingNumber(trackingNumber);

        User mockCourier = new User();
        mockCourier.setEmail(courierEmail);

        when(parcelRepository.findByTrackingNumber(trackingNumber)).thenReturn(Optional.of(mockParcel));
        when(userRepository.findByEmail(courierEmail)).thenReturn(Optional.of(mockCourier));
        when(parcelRepository.save(any(Parcel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Parcel assignedParcel = parcelService.assignToCourier(trackingNumber, courierEmail);

        assertNotNull(assignedParcel.getCourier(), "Kurier powinien zostać przypisany");
        assertEquals(courierEmail, assignedParcel.getCourier().getEmail(), "Email przypisanego kuriera musi się zgadzać");
    }

    @Test
    void shouldThrowExceptionWhenAssigningAlreadyAssignedParcel() {
        String trackingNumber = "TRACK123";

        Parcel mockParcel = new Parcel();
        mockParcel.setTrackingNumber(trackingNumber);
        mockParcel.setCourier(new User());

        when(parcelRepository.findByTrackingNumber(trackingNumber)).thenReturn(Optional.of(mockParcel));
        
        Exception exception = assertThrows(RuntimeException.class, () -> {
            parcelService.assignToCourier(trackingNumber, "new.courier@poczta.pl");
        });

        assertTrue(exception.getMessage().contains("już przypisana"), "Oczekiwano błędu o przypisanej paczce");
    }
}