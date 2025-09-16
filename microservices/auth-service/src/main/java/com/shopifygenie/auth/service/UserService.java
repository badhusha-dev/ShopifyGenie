package com.shopifygenie.auth.service;

import com.shopifygenie.auth.entity.User;
import com.shopifygenie.auth.repository.UserRepository;
import com.shopifygenie.shared.dto.UserDto;
import com.shopifygenie.shared.event.NotificationEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private KafkaTemplate<String, NotificationEvent> kafkaTemplate;
    
    public User registerUser(UserDto userDto) {
        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        
        User savedUser = userRepository.save(user);
        
        // Send welcome notification
        NotificationEvent notificationEvent = new NotificationEvent(
            "USER_REGISTERED",
            "Welcome to ShopifyGenie! Your account has been created successfully.",
            savedUser.getEmail(),
            "EMAIL",
            savedUser.getId()
        );
        
        kafkaTemplate.send("notification-events", notificationEvent);
        
        return savedUser;
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public User updateUser(Long id, UserDto userDto) {
        User user = getUserById(id);
        
        if (userDto.getFirstName() != null) {
            user.setFirstName(userDto.getFirstName());
        }
        if (userDto.getLastName() != null) {
            user.setLastName(userDto.getLastName());
        }
        if (userDto.getEmail() != null && !userDto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(userDto.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(userDto.getEmail());
        }
        
        return userRepository.save(user);
    }
    
    public void deleteUser(Long id) {
        User user = getUserById(id);
        user.setActive(false);
        userRepository.save(user);
        
        // Send account deletion notification
        NotificationEvent notificationEvent = new NotificationEvent(
            "USER_DELETED",
            "Your ShopifyGenie account has been deactivated.",
            user.getEmail(),
            "EMAIL",
            user.getId()
        );
        
        kafkaTemplate.send("notification-events", notificationEvent);
    }
}
