package com.example.hskuter.service;

import com.example.hskuter.model.User;
import com.example.hskuter.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService
{
    private final UserRepository userRepository;

    public List<User> getAllUsers()
    {
        return userRepository.findAll();
    }

    public User saveUser(User user)
    {
        return userRepository.save(user);
    }

    public User getUserById(Long id)
    {
        return userRepository.findById(id).orElseThrow(()-> new RuntimeException("User is not found:"));
    }

    @Transactional
    public User addBalance(Long userId, Double amount) {
        if (amount <= 0) throw new RuntimeException("Yükleme miktarı geçersiz!");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı!"));

        user.setBalance(user.getBalance() + amount);
        return userRepository.save(user);
    }


}
