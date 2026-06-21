package com.example.hskuter.service;

import com.example.hskuter.model.AutonomousTrip;
import com.example.hskuter.model.Scooter;
import com.example.hskuter.repository.AutonomousTripRepository;
import com.example.hskuter.repository.ScooterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AutonomousTripService {

    private final AutonomousTripRepository tripRepository;
    private final ScooterRepository scooterRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ScooterSimulator scooterSimulator;

    // 🔥 Hangi skuterin otonom sürüşünün aktif olduğunu bellek üzerinde tutan güvenli harita
    private final ConcurrentHashMap<Long, Boolean> activeAutonomousScooters = new ConcurrentHashMap<>();

    public void cancelTrip(Long scooterId) {
        // Bellekten kaydı sildiğimiz an thread döngüden çıkacak
        activeAutonomousScooters.remove(scooterId);
    }

    public void runTripSimulation(AutonomousTrip trip) {
        activeAutonomousScooters.put(trip.getScooterId(), true);

        new Thread(() -> {
            Long scooterId = trip.getScooterId();
            try {
                System.out.println("🤖 Otonom sürüş motoru tetiklendi. Araç ID: " + scooterId);

                if (scooterId == 1) {
                    scooterSimulator.setAutonomousMode(true);
                }

                Scooter scooter = scooterRepository.findById(scooterId).orElse(null);
                if (scooter != null) {
                    scooter.setStatus("EN_ROUTE");
                    scooterRepository.save(scooter);
                }

                double currentLat = trip.getStartLat();
                double currentLng = trip.getStartLng();
                double targetLat = trip.getEndLat();
                double targetLng = trip.getEndLng();

                int totalSteps = 30;
                double deltaLat = (targetLat - currentLat) / totalSteps;
                double deltaLng = (targetLng - currentLng) / totalSteps;

                boolean normalFinish = true;

                for (int i = 1; i <= totalSteps; i++) {
                    Thread.sleep(1000);

                    if (!activeAutonomousScooters.containsKey(scooterId)) {
                        System.out.println("🛑 Sürüş bellek sinyali ile acilen durduruldu! Scooter ID: " + scooterId);
                        normalFinish = false;
                        break;
                    }

                    currentLat += deltaLat;
                    currentLng += deltaLng;

                    if (scooter != null) {
                        scooter.setLatitude(currentLat);
                        scooter.setLongitude(currentLng);
                        if (scooter.getBatterylevel() > 5) {
                            scooter.setBatterylevel(scooter.getBatterylevel() - 1);
                        }
                        scooterRepository.save(scooter);
                    }

                    Map<String, Object> scooterPayload = new HashMap<>();
                    scooterPayload.put("id", scooterId);
                    scooterPayload.put("serialnumber", (scooter != null ? scooter.getSerialnumber() : "H-SKUT-0" + scooterId));
                    scooterPayload.put("latitude", currentLat);
                    scooterPayload.put("longitude", currentLng);
                    scooterPayload.put("batterylevel", (scooter != null ? scooter.getBatterylevel() : 85));
                    scooterPayload.put("status", "EN_ROUTE");

                    messagingTemplate.convertAndSend("/topic/scooters", scooterPayload);
                    System.out.println("📍 Otonom İlerliyor [" + i + "/" + totalSteps + "]: " + currentLat + ", " + currentLng);
                }

                activeAutonomousScooters.remove(scooterId);

                if (scooter != null) {
                    scooter.setStatus("AVAILABLE");
                    scooterRepository.save(scooter);
                }

                AutonomousTrip dbTrip = tripRepository.findById(trip.getId()).orElse(trip);
                dbTrip.setStatus(normalFinish ? "COMPLETED" : "CANCELLED");
                tripRepository.save(dbTrip);

                Map<String, Object> finalPayload = new HashMap<>();
                finalPayload.put("id", scooterId);
                finalPayload.put("serialnumber", (scooter != null ? scooter.getSerialnumber() : "H-SKUT-0" + scooterId));
                finalPayload.put("latitude", currentLat);
                finalPayload.put("longitude", currentLng);
                finalPayload.put("batterylevel", (scooter != null ? scooter.getBatterylevel() : 85));
                finalPayload.put("status", "AVAILABLE");

                messagingTemplate.convertAndSend("/topic/scooters", finalPayload);

                if (scooterId == 1) {
                    scooterSimulator.updateCoordinates(currentLat, currentLng);
                    scooterSimulator.setAutonomousMode(false);
                }

                System.out.println("🎯 Otonom motor döngüden başarıyla çıktı. Durum: " + (normalFinish ? "TAMAMLANDI" : "İPTAL EDİLDİ"));

            } catch (Exception e) {
                System.err.println("Simülasyon hatası: " + e.getMessage());
                activeAutonomousScooters.remove(scooterId);
                if (scooterId == 1) {
                    scooterSimulator.setAutonomousMode(false);
                }
            }
        }).start();
    }
}