package com.example.hskuter.model;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;

@Entity
@Table(name="autonomous_trips")
@RequestMapping("/api/v1/trips")
@CrossOrigin(origins = "http://localhost:3000")
@Data
public class AutonomousTrip
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long scooterId;
    private Long userId;

    private Double startLat;
    private Double startLng;

    private Double endLat;
    private Double endLng;

    private String status;



}
