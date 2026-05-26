package org.IO2.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.IO2.backend.model.Branch;
import org.IO2.backend.model.Role;
import org.IO2.backend.model.User;
import org.IO2.backend.repository.BranchRepository;
import org.IO2.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Użytkownicy", description = "Zarządzanie kontami (Admin)")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @Operation(summary = "Pobierz wszystkich użytkowników")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/{id}/role")
    @Operation(summary = "Zmień rolę użytkownika")
    public ResponseEntity<User> updateUserRole(@PathVariable Long id, @RequestParam Role newRole) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika"));
        user.setRole(newRole);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Usuń użytkownika")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/toggle-lock")
    @Operation(summary = "Zablokuj / Odblokuj konto użytkownika")
    public ResponseEntity<User> toggleUserLock(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setLocked(!user.isLocked());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/{id}/branch")
    @Operation(summary = "Przypisz pracownika do placówki (Sortownia/Okienko)")
    public ResponseEntity<User> assignBranch(@PathVariable Long id, @RequestParam(required = false) Long branchId) {
        User user = userRepository.findById(id).orElseThrow();
        if (branchId != null) {
            Branch branch = branchRepository.findById(branchId).orElseThrow();
            user.setAssignedBranch(branch);
        } else {
            user.setAssignedBranch(null); // Usunięcie przypisania
        }
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/{id}/details")
    @Operation(summary = "Edytuj dane osobowe i hasło użytkownika (Admin)")
    public ResponseEntity<?> updateUserDetails(@PathVariable Long id, @RequestBody ProfileController.ProfileUpdateRequest request) {
        User user = userRepository.findById(id).orElseThrow();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        if (request.getEmail() != null && !request.getEmail().isBlank() && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("Adres email jest już zajęty.");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return ResponseEntity.ok(userRepository.save(user));
    }
}