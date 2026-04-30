package com.example.hskuter.service;

import com.example.hskuter.model.Rental;
import com.example.hskuter.model.Scooter;
import com.example.hskuter.model.User;
import com.example.hskuter.repository.RentalRepository;
import com.example.hskuter.repository.ScooterRepository;
import com.example.hskuter.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate; // WebSocket için gerekli
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final ScooterRepository scooterRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate; // Bu eksikti, ekledik

    public Optional<Rental> findById(Long id) {
        return rentalRepository.findById(id);
    }

    public Rental saveRental(Rental rental) {
        return rentalRepository.save(rental);
    }

    @Transactional
    public User addBalance(Long userId, Double amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı!"));

        user.setBalance(user.getBalance() + amount);

        return userRepository.save(user);
    }

    @Transactional
    public Rental startRental(Long scooterId, Long userId) {
        Scooter scooter = scooterRepository.findById(scooterId)
                .orElseThrow(() -> new RuntimeException("Skuter bulunamadı! ID: " + scooterId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı! ID: " + userId));

        if (!scooter.getStatus().equalsIgnoreCase("AVAILABLE")) {
            throw new RuntimeException("Bu skuter şu an kiralanmaya uygun değil.");
        }

        if (user.getBalance() < 10.0) {
            throw new RuntimeException("Yetersiz bakiye!");
        }


        boolean hasActiveRental = rentalRepository.existsByUserAndRentalStatus(user, "ACTIVE");
        if (hasActiveRental) {
            throw new RuntimeException("Zaten aktif bir sürüşünüz var. Aynı anda birden fazla kiralama yapamazsınız!");
        }

        scooter.setStatus("BUSY");
        scooterRepository.save(scooter);

        Rental rental = new Rental();
        rental.setScooter(scooter);
        rental.setUser(user);
        rental.setStartTime(LocalDateTime.now());
        rental.setRentalStatus("ACTIVE");

        messagingTemplate.convertAndSend("/topic/scooters", scooter);

        return rentalRepository.save(rental);
    }

    @Transactional
    public Rental finishRental(Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Kiralama bulunamadı"));

        Scooter scooter = rental.getScooter();
        User user = rental.getUser();


        int currentBattery = scooter.getBatterylevel();
        scooter.setBatterylevel(Math.max(0, currentBattery - 10));

        user.setBalance(user.getBalance() - 15.0);

        scooter.setStatus("AVAILABLE");

        userRepository.save(user);
        scooterRepository.save(scooter);

        rental.setRentalStatus("FINISHED");
        rentalRepository.save(rental);

        messagingTemplate.convertAndSend("/topic/scooters", scooter);

        return rental;
    }
}