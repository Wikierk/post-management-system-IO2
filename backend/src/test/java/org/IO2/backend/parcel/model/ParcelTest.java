package org.IO2.backend.parcel.model;

import org.IO2.backend.model.Role;
import org.IO2.backend.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ParcelTest {

    private User testSender;
    private User testCourier;

    @BeforeEach
    void setUp() {
        testSender = User.builder()
                .email("sender@example.com")
                .password("secret")
                .role(Role.CLIENT)
                .build();

        testCourier = User.builder()
                .email("courier@example.com")
                .password("secret")
                .role(Role.COURIER)
                .build();
    }

    @Test
    void shouldCreateParcelWithBuilder() {
        String trackingNumber = "TRACK123456";
        String receiverName = "John Receiver";
        String receiverEmail = "receiver@example.com";
        String receiverAddress = "ul. Testowa 1, 00-000 Warszawa";

        Parcel parcel = Parcel.builder()
                .trackingNumber(trackingNumber)
                .sender(testSender)
                .courier(testCourier)
                .receiverName(receiverName)
                .receiverEmail(receiverEmail)
                .receiverAddress(receiverAddress)
                .size(ParcelSize.SMALL)
                .weight(1.5)
                .isPriority(false)
                .isInsured(false)
                .price(new BigDecimal("10.00"))
                .status(ParcelStatus.CREATED)
                .build();

        assertNotNull(parcel);
        assertEquals(trackingNumber, parcel.getTrackingNumber());
        assertEquals(testSender, parcel.getSender());
        assertEquals(testCourier, parcel.getCourier());
        assertEquals(receiverName, parcel.getReceiverName());
        assertEquals(receiverEmail, parcel.getReceiverEmail());
        assertEquals(receiverAddress, parcel.getReceiverAddress());
        assertEquals(ParcelSize.SMALL, parcel.getSize());
        assertEquals(1.5, parcel.getWeight());
        assertFalse(parcel.getIsPriority());
        assertFalse(parcel.getIsInsured());
        assertEquals(new BigDecimal("10.00"), parcel.getPrice());
        assertEquals(ParcelStatus.CREATED, parcel.getStatus());
    }

    @Test
    void shouldSetCreatedAtOnCreate() {
        Parcel parcel = Parcel.builder()
                .trackingNumber("TRACK789")
                .sender(testSender)
                .status(ParcelStatus.CREATED)
                .build();

        parcel.onCreate();

        assertNotNull(parcel.getCreatedAt());
        assertTrue(parcel.getCreatedAt().isBefore(LocalDateTime.now().plusSeconds(1)));
    }

    @Test
    void shouldHandleParcelWithPriorityAndInsurance() {
        // Arrange
        Parcel parcel = Parcel.builder()
                .trackingNumber("TRACK456")
                .sender(testSender)
                .isPriority(true)
                .isInsured(true)
                .status(ParcelStatus.CREATED)
                .build();

        assertTrue(parcel.getIsPriority());
        assertTrue(parcel.getIsInsured());
    }

    @Test
    void shouldAllowNullCourier() {
        Parcel parcel = Parcel.builder()
                .trackingNumber("TRACK999")
                .sender(testSender)
                .status(ParcelStatus.CREATED)
                .build();

        assertNull(parcel.getCourier());
    }

    @Test
    void shouldTrackParcelStatusChanges() {
        Parcel parcel = Parcel.builder()
                .trackingNumber("TRACK111")
                .sender(testSender)
                .status(ParcelStatus.CREATED)
                .build();

        parcel.setStatus(ParcelStatus.PAID);
        assertEquals(ParcelStatus.PAID, parcel.getStatus());
    }

    @Test
    void shouldHandleAllParcelSizes() {
        Parcel smallParcel = Parcel.builder()
                .trackingNumber("TRACK001")
                .sender(testSender)
                .size(ParcelSize.SMALL)
                .status(ParcelStatus.CREATED)
                .build();

        Parcel mediumParcel = Parcel.builder()
                .trackingNumber("TRACK002")
                .sender(testSender)
                .size(ParcelSize.MEDIUM)
                .status(ParcelStatus.CREATED)
                .build();

        Parcel largeParcel = Parcel.builder()
                .trackingNumber("TRACK003")
                .sender(testSender)
                .size(ParcelSize.LARGE)
                .status(ParcelStatus.CREATED)
                .build();

        assertEquals(ParcelSize.SMALL, smallParcel.getSize());
        assertEquals(ParcelSize.MEDIUM, mediumParcel.getSize());
        assertEquals(ParcelSize.LARGE, largeParcel.getSize());
    }

    @Test
    void shouldHandleVariousWeights() {
        Parcel lightParcel = Parcel.builder()
                .trackingNumber("TRACK001")
                .sender(testSender)
                .weight(0.5)
                .status(ParcelStatus.CREATED)
                .build();

        Parcel heavyParcel = Parcel.builder()
                .trackingNumber("TRACK002")
                .sender(testSender)
                .weight(30.0)
                .status(ParcelStatus.CREATED)
                .build();

        assertEquals(0.5, lightParcel.getWeight());
        assertEquals(30.0, heavyParcel.getWeight());
    }

    @Test
    void shouldSetAndGetParcelId() {
        Long id = 1L;
        Parcel parcel = Parcel.builder()
                .id(id)
                .trackingNumber("TRACK123")
                .sender(testSender)
                .status(ParcelStatus.CREATED)
                .build();

        assertEquals(id, parcel.getId());
    }

    @Test
    void shouldHandleParcelVersion() {
        Parcel parcel = Parcel.builder()
                .trackingNumber("TRACK555")
                .sender(testSender)
                .status(ParcelStatus.CREATED)
                .build();

        parcel.setVersion(1L);

        // Assert
        assertEquals(1L, parcel.getVersion());
    }

    @Test
    void shouldCreateParcelWithNoArgsConstructor() {
        Parcel parcel = new Parcel();
        assertNotNull(parcel);
    }

    @Test
    void shouldCreateParcelWithAllArgsConstructor() {
        Long id = 2L;
        Long version = 1L;
        LocalDateTime createdAt = LocalDateTime.now();

        Parcel parcel = new Parcel(
                id,
                version,
                "TRACK444",
                testSender,
                testCourier,
                "Jane Receiver",
                "jane@example.com",
                "ul. Nowa 2, 00-000 Warszawa",
                ParcelSize.MEDIUM,
                2.5,
                true,
                false,
                new BigDecimal("25.00"),
                ParcelStatus.PAID,
                createdAt
        );

        // Assert
        assertEquals(id, parcel.getId());
        assertEquals(version, parcel.getVersion());
        assertEquals("TRACK444", parcel.getTrackingNumber());
        assertEquals(testSender, parcel.getSender());
        assertEquals(testCourier, parcel.getCourier());
        assertEquals("Jane Receiver", parcel.getReceiverName());
        assertEquals("jane@example.com", parcel.getReceiverEmail());
        assertEquals("ul. Nowa 2, 00-000 Warszawa", parcel.getReceiverAddress());
        assertEquals(ParcelSize.MEDIUM, parcel.getSize());
        assertEquals(2.5, parcel.getWeight());
        assertTrue(parcel.getIsPriority());
        assertFalse(parcel.getIsInsured());
        assertEquals(new BigDecimal("25.00"), parcel.getPrice());
        assertEquals(ParcelStatus.PAID, parcel.getStatus());
        assertEquals(createdAt, parcel.getCreatedAt());
    }

    @Test
    void shouldHandleMultipleStatusTransitions() {
        Parcel parcel = Parcel.builder()
                .trackingNumber("TRACK777")
                .sender(testSender)
                .status(ParcelStatus.CREATED)
                .build();

        parcel.setStatus(ParcelStatus.PAID);
        assertEquals(ParcelStatus.PAID, parcel.getStatus());

        parcel.setStatus(ParcelStatus.IN_SORTING);
        assertEquals(ParcelStatus.IN_SORTING, parcel.getStatus());

        parcel.setStatus(ParcelStatus.OUT_FOR_DELIVERY);
        assertEquals(ParcelStatus.OUT_FOR_DELIVERY, parcel.getStatus());

        parcel.setStatus(ParcelStatus.DELIVERED);
        // Assert
        assertEquals(ParcelStatus.DELIVERED, parcel.getStatus());
    }
}

