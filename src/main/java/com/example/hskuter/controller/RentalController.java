package com.example.hskuter.controller;

import com.example.hskuter.model.AutonomousTrip;
import com.example.hskuter.model.User;
import com.example.hskuter.service.RentalService;
import com.example.hskuter.service.AutonomousTripService;
import com.example.hskuter.repository.AutonomousTripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rentals")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;
    private final AutonomousTripRepository tripRepository;
    private final AutonomousTripService autonomousTripService;

    @PostMapping("/start/{scooterId}/{userId}")
    public ResponseEntity<?> start(@PathVariable Long scooterId, @PathVariable Long userId) {
        try {
            return ResponseEntity.ok(rentalService.startRental(scooterId, userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/finish/{rentalId}")
    public ResponseEntity<?> finish(@PathVariable Long rentalId) {
        rentalService.finishRental(rentalId);
        return ResponseEntity.ok("Sürüş bitirildi, veriler güncellendi.");
    }

    @PostMapping("/add-balance/{userId}/{amount}")
    public ResponseEntity<User> addBalance(@PathVariable Long userId, @PathVariable Double amount) {
        User updatedUser = rentalService.addBalance(userId, amount);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/autonomous-request")
    public ResponseEntity<?> createAutonomousTrip(@RequestBody AutonomousTrip trip) {
        try {
            trip.setStatus("IN_PROGRESS");
            AutonomousTrip saved = tripRepository.save(trip);

            autonomousTripService.runTripSimulation(saved);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Otonom rota başlatılamadı: " + e.getMessage());
        }
    }

    @PostMapping("/autonomous-cancel/{scooterId}")
    public ResponseEntity<?> cancelAutonomousTrip(@PathVariable Long scooterId) {
        try {
            autonomousTripService.cancelTrip(scooterId);
            return ResponseEntity.ok("Otonom sürüş iptal sinyali gönderildi.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("İptal işlemi başarısız: " + e.getMessage());
        }
    }
}