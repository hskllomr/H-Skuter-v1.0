package com.example.hskuter.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Rental
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Scooter scooter;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private double totalPrice;

    private String rentalStatus;

}
