package com.example.hskuter.controller;

import com.example.hskuter.Dto.LoginRequest;
import com.example.hskuter.Dto.RegisterRequest;
import com.example.hskuter.Security.JwtUtil;
import com.example.hskuter.service.AuthService;
import com.example.hskuter.repository.UserRepository;
import com.example.hskuter.model.User;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            final UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmail());

            if (passwordEncoder.matches(loginRequest.getPassword(), userDetails.getPassword())) {

                final String jwt = jwtUtil.generateToken(userDetails);

                User user = userRepository.findByEmail(loginRequest.getEmail())
                        .orElseThrow(() -> new RuntimeException("Kullanıcı veritabanında bulunamadı!"));

                Map<String, Object> response = new HashMap<>();
                response.put("token", jwt);
                response.put("id", user.getId());
                response.put("name", user.getName());
                response.put("balance", user.getBalance());
                response.put("email", user.getEmail());

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body(Map.of("error", "Hatalı şifre!"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Giriş başarısız: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok("Kayıt başarıyla gerçekleşti.");
    }
}