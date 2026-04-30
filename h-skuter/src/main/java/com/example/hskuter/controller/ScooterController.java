package com.example.hskuter.controller;

import com.example.hskuter.model.Scooter;
import com.example.hskuter.service.ScooterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/scooters")
@CrossOrigin(origins = "*") // Kiralama hatasını çözen kritik satır!
public class ScooterController {

    @Autowired
    private ScooterService scooterService;

    @GetMapping
    public List<Scooter> getAllScooters(@RequestParam(required = false) Double lat,
                                        @RequestParam(required = false) Double lng) {
        if (lat != null && lng != null) {
            return scooterService.getNearestScooters(lat, lng);
        }
        return scooterService.getAllScooter(); // Bu da List<Scooter> dönecek
    }

    @PutMapping("/{id}")
    public ResponseEntity<Scooter> updateScooter(@PathVariable Long id, @RequestBody Scooter scooterDetails) {
        // orElseThrow'u sildik çünkü servis zaten direkt Scooter nesnesi dönüyor
        Scooter scooter = scooterService.findById(id);

        // Güncellemeler
        scooter.setStatus(scooterDetails.getStatus());
        scooter.setLatitude(scooterDetails.getLatitude());
        scooter.setLongitude(scooterDetails.getLongitude());

        // Kayıt
        Scooter updated = scooterService.saveScooter(scooter);
        return ResponseEntity.ok(updated);
    }
}