package org.IO2.backend.controller;

import java.util.List;
import org.IO2.backend.model.Branch;
import org.IO2.backend.repository.BranchRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import lombok.RequiredArgsConstructor;

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

    @GetMapping("/paginated")
    @Operation(summary = "Pobierz placówki (paginacja + wyszukiwanie)")
    public ResponseEntity<Page<Branch>> getPaginatedBranches(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "") String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Branch> result = search.isEmpty()
                ? branchRepository.findAll(pageable)
                : branchRepository.findBySearchTerm(search, pageable);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    @Operation(summary = "Dodaj nową placówkę")
    @PreAuthorize("hasRole('ADMIN')")
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