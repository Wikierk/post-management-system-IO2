package org.IO2.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.IO2.backend.model.Role;
import org.IO2.backend.model.User;
import org.IO2.backend.repository.UserRepository;
import org.IO2.backend.dto.AuthRequest;
import org.IO2.backend.dto.AuthResponse;
import org.IO2.backend.dto.RegisterRequest;
import org.IO2.backend.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autoryzacja", description = "Endpointy do zarządzania kontami użytkowników")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    @Operation(summary = "Rejestracja nowego użytkownika")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        if(userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CLIENT)
                .build();

        userRepository.save(user);

        var extraClaims = new java.util.HashMap<String, Object>();
        extraClaims.put("role", user.getRole().name());
        var jwtToken = jwtService.generateToken(extraClaims, user);

        return ResponseEntity.ok(new AuthResponse(jwtToken));
    }

    @PostMapping("/login")
    @Operation(summary = "Logowanie użytkownika")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(
                    Map.of("message", "Nieprawidłowy email lub hasło")
            );
        }

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        if (user.isLocked()) {
            return ResponseEntity.status(403).body(
                    Map.of(
                            "message",
                            "Konto zostało zablokowane przez Administratora."
                    )
            );
        }

        var extraClaims = new HashMap<String, Object>();
        extraClaims.put("role", user.getRole().name());

        var jwtToken = jwtService.generateToken(extraClaims, user);

        return ResponseEntity.ok(new AuthResponse(jwtToken));
    }

}

