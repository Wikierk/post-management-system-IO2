package org.IO2.backend.controller;

import java.util.List;

import org.IO2.backend.model.Complaint;
import org.IO2.backend.model.User;
import org.IO2.backend.parcel.model.Parcel;
import org.IO2.backend.parcel.repository.ComplaintRepository;
import org.IO2.backend.parcel.repository.ParcelRepository;
import org.IO2.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;

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

    @GetMapping("/paginated")
    @Operation(summary = "Pobierz reklamacje (paginacja + wyszukiwanie)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Complaint>> getPaginatedComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "PENDING") String status,
            @RequestParam(defaultValue = "") String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Complaint> result = search.isEmpty()
                ? complaintRepository.findByStatus(status, pageable)
                : complaintRepository.findByStatusAndSearchTerm(status, search, pageable);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/resolve")
    @Operation(summary = "Rozpatrz reklamację (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Complaint> resolveComplaint(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String responseMessage,
            @RequestParam(required = false) String parcelAction) {

        Complaint complaint = complaintRepository.findById(id).orElseThrow();
        complaint.setStatus(status);

        if (responseMessage != null && !responseMessage.isBlank()) {
            complaint.setAdminResponse(responseMessage);
        }

        if (parcelAction != null && !parcelAction.isBlank()) {
            Parcel parcel = complaint.getParcel();
            try {
                org.IO2.backend.parcel.model.ParcelStatus newStatus =
                        org.IO2.backend.parcel.model.ParcelStatus.valueOf(parcelAction);

                parcel.setStatus(newStatus);
                parcelRepository.save(parcel);
            } catch (IllegalArgumentException e) {
                System.err.println("Podano nieprawidłowy status dla paczki po reklamacji: " + parcelAction);
            }
        }

        return ResponseEntity.ok(complaintRepository.save(complaint));
    }

    @Data
    public static class ComplaintRequest {
        private String trackingNumber;
        private String reason;
    }
}

