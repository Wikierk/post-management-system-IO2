package org.IO2.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.IO2.backend.model.Complaint;
import org.IO2.backend.model.User;
import org.IO2.backend.parcel.model.Parcel;
import org.IO2.backend.parcel.repository.ComplaintRepository;
import org.IO2.backend.parcel.repository.ParcelRepository;
import org.IO2.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
@Tag(name = "Reklamacje", description = "Zarządzanie zgłoszeniami")
@SecurityRequirement(name = "bearerAuth")
public class ComplaintController {

    private final ComplaintRepository complaintRepository;
    private final ParcelRepository parcelRepository;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Zgłoś reklamację (Klient)")
    public ResponseEntity<Complaint> submitComplaint(@RequestBody ComplaintRequest request, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        Parcel parcel = parcelRepository.findByTrackingNumber(request.getTrackingNumber()).orElseThrow();

        parcel.setStatus(org.IO2.backend.parcel.model.ParcelStatus.IN_COMPLAINT);
        parcelRepository.save(parcel);

        Complaint complaint = Complaint.builder()
                .parcel(parcel)
                .submittedBy(user)
                .reason(request.getReason())
                .status("PENDING")
                .build();

        return ResponseEntity.ok(complaintRepository.save(complaint));
    }

    @GetMapping("/my")
    @Operation(summary = "Pobierz moje reklamacje (Klient)")
    public ResponseEntity<List<Complaint>> getMyComplaints(Authentication auth) {
        return ResponseEntity.ok(complaintRepository.findBySubmittedByEmail(auth.getName()));
    }

    @GetMapping("/all")
    @Operation(summary = "Pobierz wszystkie reklamacje (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintRepository.findAll());
    }

    @PutMapping("/{id}/resolve")
    @Operation(summary = "Rozpatrz reklamację (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Complaint> resolveComplaint(@PathVariable Long id, @RequestParam String status) {
        Complaint complaint = complaintRepository.findById(id).orElseThrow();
        complaint.setStatus(status); // ACCEPTED lub REJECTED
        return ResponseEntity.ok(complaintRepository.save(complaint));
    }

    @Data
    public static class ComplaintRequest {
        private String trackingNumber;
        private String reason;
    }
}

