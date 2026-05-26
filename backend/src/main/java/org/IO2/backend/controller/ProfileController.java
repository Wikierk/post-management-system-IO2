package org.IO2.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.IO2.backend.model.User;
import org.IO2.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ProfileController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // POTRZEBNE DO ZMIANY HASŁA

    @GetMapping
    @Operation(summary = "Pobierz dane swojego profilu")
    public ResponseEntity<User> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(userRepository.findByEmail(auth.getName()).orElseThrow());
    }

    @PutMapping
    @Operation(summary = "Edytuj wszystkie swoje dane")
    public ResponseEntity<?> updateMyProfile(@RequestBody ProfileUpdateRequest request, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        // Zmiana Emaila (sprawdzenie czy wolny)
        if (request.getEmail() != null && !request.getEmail().isBlank() && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("Podany adres email jest już zajęty.");
            }
            user.setEmail(request.getEmail());
        }

        // Zmiana Hasła
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    @Data
    public static class ProfileUpdateRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String password;
    }
}