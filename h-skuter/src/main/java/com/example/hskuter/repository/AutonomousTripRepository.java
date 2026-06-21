package com.example.hskuter.repository;

import com.example.hskuter.model.AutonomousTrip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AutonomousTripRepository extends JpaRepository<AutonomousTrip, Long> {
}