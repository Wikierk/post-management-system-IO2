package org.IO2.backend.model;

import org.IO2.backend.parcel.model.Parcel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ComplaintTest {

    private Parcel testParcel;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .email("user@example.com")
                .password("secret")
                .firstName("John")
                .lastName("Doe")
                .role(Role.CLIENT)
                .build();

        testParcel = Parcel.builder()
                .trackingNumber("TRACK123456")
                .sender(testUser)
                .build();
    }

    @Test
    void shouldCreateComplaintWithBuilder() {
        String reason = "Package arrived damaged";
        String status = "PENDING";

        Complaint complaint = Complaint.builder()
                .parcel(testParcel)
                .submittedBy(testUser)
                .reason(reason)
                .status(status)
                .build();

        assertNotNull(complaint);
        assertEquals(testParcel, complaint.getParcel());
        assertEquals(testUser, complaint.getSubmittedBy());
        assertEquals(reason, complaint.getReason());
        assertEquals(status, complaint.getStatus());
    }

    @Test
    void shouldDefaultStatusToPendingOnCreate() {
        Complaint complaint = Complaint.builder()
                .parcel(testParcel)
                .submittedBy(testUser)
                .reason("Item missing")
                .build();

        complaint.onCreate();

        assertEquals("PENDING", complaint.getStatus());
        assertNotNull(complaint.getSubmittedAt());
    }

    @Test
    void shouldSetSubmittedAtOnCreate() {
        Complaint complaint = Complaint.builder()
                .parcel(testParcel)
                .submittedBy(testUser)
                .reason("Wrong recipient")
                .status("PENDING")
                .build();

        complaint.onCreate();

        assertNotNull(complaint.getSubmittedAt());
        assertTrue(complaint.getSubmittedAt().isBefore(LocalDateTime.now().plusSeconds(1)));
    }

    @Test
    void shouldAllowSettingAdminResponse() {
        String reason = "Package damaged";
        String response = "Compensation approved";
        Complaint complaint = Complaint.builder()
                .parcel(testParcel)
                .submittedBy(testUser)
                .reason(reason)
                .status("PENDING")
                .build();

        complaint.setAdminResponse(response);

        assertEquals(response, complaint.getAdminResponse());
    }

    @Test
    void shouldAllowModifyingComplaintStatus() {
        Complaint complaint = Complaint.builder()
                .parcel(testParcel)
                .submittedBy(testUser)
                .reason("Issue with package")
                .status("PENDING")
                .build();

        complaint.setStatus("RESOLVED");

        assertEquals("RESOLVED", complaint.getStatus());
    }

    @Test
    void shouldCreateComplaintWithNoArgsConstructor() {
        Complaint complaint = new Complaint();

        assertNotNull(complaint);
    }

    @Test
    void shouldCreateComplaintWithAllArgsConstructor() {
        Long id = 1L;
        LocalDateTime submittedAt = LocalDateTime.now();
        String adminResponse = "Case reviewed";

        Complaint complaint = new Complaint(
                id,
                testParcel,
                testUser,
                "Package not delivered",
                "PENDING",
                submittedAt,
                adminResponse
        );

        assertEquals(id, complaint.getId());
        assertEquals(testParcel, complaint.getParcel());
        assertEquals(testUser, complaint.getSubmittedBy());
        assertEquals("Package not delivered", complaint.getReason());
        assertEquals("PENDING", complaint.getStatus());
        assertEquals(submittedAt, complaint.getSubmittedAt());
        assertEquals(adminResponse, complaint.getAdminResponse());
    }
}

