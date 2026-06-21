package com.example.hskuter.service;

import com.example.hskuter.model.Scooter;
import com.example.hskuter.repository.ScooterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScooterService {
    private final ScooterRepository scooterRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final Random random = new Random();

    @Scheduled(fixedRate = 2000)
    @Transactional
    public void simulateScooters() {
        List<Scooter> allScooters = scooterRepository.findAll();
        for (Scooter scooter : allScooters) {
            if ("BUSY".equals(scooter.getStatus())) {
                double newLat = scooter.getLatitude() + (random.nextDouble() - 0.5) * 0.002;
                double newLng = scooter.getLongitude() + (random.nextDouble() - 0.5) * 0.002;

                scooter.setLatitude(newLat);
                scooter.setLongitude(newLng);

                scooterRepository.saveAndFlush(scooter);

                messagingTemplate.convertAndSend("/topic/scooters", scooter);
            }
        }
    }

    public Scooter findById(Long id) {
        return scooterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scooter bulunamadı"));
    }

    public Scooter saveScooter(Scooter scooter) {
        return scooterRepository.saveAndFlush(scooter);
    }


    public void deleteScooter(Long id) {
        scooterRepository.deleteById(id);
    }

    public List<Scooter> getNearestScooters(Double lat, Double lng) {
        List<Scooter> scooters = scooterRepository.findAll();

        for (Scooter s : scooters) {
            double d = calculateDistance(lat, lng, s.getLatitude(), s.getLongitude());
            s.setDistance(d);
        }

        scooters.sort(Comparator.comparingDouble(Scooter::getDistance));
        return scooters;
    }

    public List<Scooter> getAllScooter()
    {
        return scooterRepository.findAll();
    }


    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        double lonDiff = lng1 - lng2;
        double latDiff = lat1 - lat2;
        return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111000;
    }



}