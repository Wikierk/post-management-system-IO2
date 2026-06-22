package org.IO2.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.IO2.backend.model.Pricing;
import org.IO2.backend.parcel.repository.PricingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pricings")
@RequiredArgsConstructor
@Tag(name = "Cennik", description = "Zarządzanie kosztami przesyłek (Admin)")
@SecurityRequirement(name = "bearerAuth")
public class PricingController {

    private final PricingRepository pricingRepository;

    @GetMapping
    @Operation(summary = "Pobierz cennik (Dostępne dla wszystkich zalogowanych)")
    public ResponseEntity<List<Pricing>> getAllPricings() {
        return ResponseEntity.ok(pricingRepository.findAll());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Edytuj dany gabaryt cenowy")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Pricing> updatePricing(@PathVariable Long id, @RequestBody Pricing updatedPricing) {
        Pricing existing = pricingRepository.findById(id).orElseThrow();
        existing.setBasePrice(updatedPricing.getBasePrice());
        existing.setWeightMultiplier(updatedPricing.getWeightMultiplier());
        existing.setPriorityAddon(updatedPricing.getPriorityAddon());
        existing.setInsuranceAddon(updatedPricing.getInsuranceAddon());
        return ResponseEntity.ok(pricingRepository.save(existing));
    }
}
