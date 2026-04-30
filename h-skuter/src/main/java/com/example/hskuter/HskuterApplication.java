package com.example.hskuter;

import com.example.hskuter.model.Scooter;
import com.example.hskuter.repository.ScooterRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.List;

@SpringBootApplication
@EnableScheduling
public class HskuterApplication {

    public static void main(String[] args) {
        SpringApplication.run(HskuterApplication.class, args);
    }


}