package org.IO2.backend.parcel.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.IO2.backend.parcel.model.Parcel;
import org.IO2.backend.parcel.service.ParcelService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parcels")
@RequiredArgsConstructor
@Tag(name = "Przesyłki", description = "Zarządzanie paczkami")
@SecurityRequirement(name = "bearerAuth")
public class ParcelController {

    private final ParcelService parcelService;

    @PostMapping
    @Operation(summary = "Nadaj nową paczkę")
    public ResponseEntity<Parcel> createParcel(@RequestBody Parcel request, Authentication authentication) {
        String senderEmail = authentication.getName();
        return ResponseEntity.ok(parcelService.createParcel(request, senderEmail));
    }

    @GetMapping("/my")
    @Operation(summary = "Pobierz moje paczki")
    public ResponseEntity<List<Parcel>> getMyParcels(Authentication authentication) {
        return ResponseEntity.ok(parcelService.getMyParcels(authentication.getName()));
    }

    @GetMapping("/{trackingNumber}")
    @Operation(summary = "Śledź paczkę po numerze (Tracking)")
    public ResponseEntity<Parcel> trackParcel(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(parcelService.getParcelByTracking(trackingNumber));
    }

    @PutMapping("/{trackingNumber}/next-state")
    @Operation(summary = "Przesuń paczkę do kolejnego statusu (Dla kurierów/sortowni)")
    public ResponseEntity<Parcel> advanceStatus(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(parcelService.advanceStatus(trackingNumber));
    }

    @GetMapping("/unassigned")
    @Operation(summary = "Pobierz paczki bez kuriera")
    public ResponseEntity<List<Parcel>> getUnassignedParcels() {
        return ResponseEntity.ok(parcelService.getUnassignedParcels());
    }

    @GetMapping("/courier")
    @Operation(summary = "Pobierz paczki przypisane do kuriera")
    public ResponseEntity<List<Parcel>> getCourierParcels(Authentication auth) {
        return ResponseEntity.ok(parcelService.getCourierParcels(auth.getName()));
    }

    @PutMapping("/{trackingNumber}/assign")
    @Operation(summary = "Przypisz paczkę do aktualnie zalogowanego kuriera")
    public ResponseEntity<Parcel> assignToCourier(@PathVariable String trackingNumber, Authentication auth) {
        return ResponseEntity.ok(parcelService.assignToCourier(trackingNumber, auth.getName()));
    }
}
