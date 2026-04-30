package com.example.hskuter.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class ScooterSimulator {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private double currentLat = 38.7205;
    private double currentLng = 35.4826;


    private double latStep = 0.000015;
    private double lngStep = 0.000025;


    @Scheduled(fixedRate = 500)
    public void simulateMovement() {

        currentLat += latStep;
        currentLng += lngStep;

        if (currentLat > 38.7400 || currentLat < 38.7100) latStep *= -1;
        if (currentLng > 35.5100 || currentLng < 35.4700) lngStep *= -1;

        Map<String, Object> scooterData = new HashMap<>();
        scooterData.put("id", 1);
        scooterData.put("serialnumber", "H-SKUT-01");
        scooterData.put("latitude", currentLat);
        scooterData.put("longitude", currentLng);
        scooterData.put("status", "AVAILABLE");
        scooterData.put("batterylevel", 88);

        messagingTemplate.convertAndSend("/topic/scooters", scooterData);
    }
}