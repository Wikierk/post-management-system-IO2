package org.IO2.backend.parcel.model;

import org.IO2.backend.model.Branch;
import org.IO2.backend.model.Role;
import org.IO2.backend.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ParcelHistoryTest {

    private Parcel testParcel;
    private User testUser;
    private Branch testBranch;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .email("user@example.com")
                .password("secret")
                .role(Role.COURIER)
                .build();

        testBranch = Branch.builder()
                .name("Branch Warszawa")
                .address("ul. Marszałkowska 1, 00-000 Warszawa")
                .type("DISTRIBUTION_CENTER")
                .build();

        testParcel = Parcel.builder()
                .trackingNumber("TRACK123456")
                .sender(testUser)
                .status(ParcelStatus.CREATED)
                .build();
    }

    @Test
    void shouldCreateParcelHistoryWithBuilder() {
        LocalDateTime changedAt = LocalDateTime.now();

        ParcelHistory history = ParcelHistory.builder()
                .parcel(testParcel)
                .status(ParcelStatus.PAID)
                .changedBy(testUser)
                .branch(testBranch)
                .changedAt(changedAt)
                .build();

        assertNotNull(history);
        assertEquals(testParcel, history.getParcel());
        assertEquals(ParcelStatus.PAID, history.getStatus());
        assertEquals(testUser, history.getChangedBy());
        assertEquals(testBranch, history.getBranch());
        assertEquals(changedAt, history.getChangedAt());
    }

    @Test
    void shouldSetAndGetParcelHistoryId() {
        Long id = 1L;
        ParcelHistory history = ParcelHistory.builder()
                .id(id)
                .parcel(testParcel)
                .status(ParcelStatus.IN_SORTING)
                .changedBy(testUser)
                .branch(testBranch)
                .build();

        assertEquals(id, history.getId());
    }

    @Test
    void shouldTrackParcelStatusChange() {
        ParcelHistory history = ParcelHistory.builder()
                .parcel(testParcel)
                .status(ParcelStatus.OUT_FOR_DELIVERY)
                .changedBy(testUser)
                .branch(testBranch)
                .build();

        assertEquals(ParcelStatus.OUT_FOR_DELIVERY, history.getStatus());
        assertEquals(testUser, history.getChangedBy());
    }

    @Test
    void shouldAllowNullChangedByUser() {
        ParcelHistory history = ParcelHistory.builder()
                .parcel(testParcel)
                .status(ParcelStatus.DELIVERED)
                .branch(testBranch)
                .build();

        assertNull(history.getChangedBy());
    }

    @Test
    void shouldAllowNullBranch() {
        ParcelHistory history = ParcelHistory.builder()
                .parcel(testParcel)
                .status(ParcelStatus.PAID)
                .changedBy(testUser)
                .build();

        assertNull(history.getBranch());
    }

    @Test
    void shouldSetChangedAtOnCreate() {
        ParcelHistory history = ParcelHistory.builder()
                .parcel(testParcel)
                .status(ParcelStatus.CREATED)
                .changedBy(testUser)
                .build();

        history.onCreate();

        assertNotNull(history.getChangedAt());
        assertTrue(history.getChangedAt().isBefore(LocalDateTime.now().plusSeconds(1)));
    }

    @Test
    void shouldAllowModifyingHistoryFields() {
        User newUser = User.builder()
                .email("courier@example.com")
                .password("secret")
                .role(Role.SORTING_WORKER)
                .build();

        Branch newBranch = Branch.builder()
                .name("Branch Kraków")
                .address("ul. Floriańska 1, 31-019 Kraków")
                .type("SORTING_CENTER")
                .build();

        ParcelHistory history = ParcelHistory.builder()
                .parcel(testParcel)
                .status(ParcelStatus.PAID)
                .changedBy(testUser)
                .branch(testBranch)
                .build();

        history.setStatus(ParcelStatus.IN_SORTING);
        history.setChangedBy(newUser);
        history.setBranch(newBranch);

        assertEquals(ParcelStatus.IN_SORTING, history.getStatus());
        assertEquals(newUser, history.getChangedBy());
        assertEquals(newBranch, history.getBranch());
    }

    @Test
    void shouldCreateParcelHistoryWithNoArgsConstructor() {
        ParcelHistory history = new ParcelHistory();
        assertNotNull(history);
    }

    @Test
    void shouldCreateParcelHistoryWithAllArgsConstructor() {
        Long id = 2L;
        LocalDateTime changedAt = LocalDateTime.now();

        ParcelHistory history = new ParcelHistory(
                id,
                testParcel,
                ParcelStatus.RETURNED,
                testUser,
                testBranch,
                changedAt
        );

        assertEquals(id, history.getId());
        assertEquals(testParcel, history.getParcel());
        assertEquals(ParcelStatus.RETURNED, history.getStatus());
        assertEquals(testUser, history.getChangedBy());
        assertEquals(testBranch, history.getBranch());
        assertEquals(changedAt, history.getChangedAt());
    }

    @Test
    void shouldTrackDeliveryStateTransition() {
        ParcelHistory createdHistory = ParcelHistory.builder()
                .parcel(testParcel)
                .status(ParcelStatus.CREATED)
                .build();

        ParcelHistory paidHistory = ParcelHistory.builder()
                .parcel(testParcel)
                .status(ParcelStatus.PAID)
                .build();

        assertEquals(ParcelStatus.CREATED, createdHistory.getStatus());
        assertEquals(ParcelStatus.PAID, paidHistory.getStatus());
    }
}

