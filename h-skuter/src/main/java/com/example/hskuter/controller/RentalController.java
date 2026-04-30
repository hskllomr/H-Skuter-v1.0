package com.example.hskuter.controller;

import com.example.hskuter.model.User;
import com.example.hskuter.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rentals")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;

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
}