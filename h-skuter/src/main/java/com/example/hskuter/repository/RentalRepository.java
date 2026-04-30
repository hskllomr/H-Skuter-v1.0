package com.example.hskuter.repository;

import com.example.hskuter.model.Rental;
import com.example.hskuter.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RentalRepository extends JpaRepository<Rental,Long>
{
    boolean existsByUserAndRentalStatus(User user, String rentalStatus);
}
