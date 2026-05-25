package org.IO2.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.IO2.backend.model.Branch;
import org.IO2.backend.repository.BranchRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
@Tag(name = "Placówki", description = "Zarządzanie oddziałami (Admin)")
@SecurityRequirement(name = "bearerAuth")
public class BranchController {

    private final BranchRepository branchRepository;

    @GetMapping
    @Operation(summary = "Pobierz wszystkie placówki")
    public ResponseEntity<List<Branch>> getAllBranches() {
        return ResponseEntity.ok(branchRepository.findAll());
    }

    @PostMapping
    @Operation(summary = "Dodaj nową placówkę")
    @PreAuthorize("hasRole('ADMIN')") // Tylko admin może dodawać placówki
    public ResponseEntity<Branch> createBranch(@RequestBody Branch branch) {
        return ResponseEntity.ok(branchRepository.save(branch));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Usuń placówkę")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBranch(@PathVariable Long id) {
        branchRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Edytuj placówkę")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Branch> updateBranch(@PathVariable Long id, @RequestBody Branch updated) {
        Branch branch = branchRepository.findById(id).orElseThrow();
        branch.setName(updated.getName());
        branch.setAddress(updated.getAddress());
        branch.setType(updated.getType());
        return ResponseEntity.ok(branchRepository.save(branch));
    }
}