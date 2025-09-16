package com.shopifygenie.auth.controller;

import com.shopifygenie.auth.entity.User;
import com.shopifygenie.auth.service.UserService;
import com.shopifygenie.shared.dto.UserDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication and user management APIs")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account")
    public ResponseEntity<User> registerUser(@Valid @RequestBody UserDto userDto) {
        User user = userService.registerUser(userDto);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/profile")
    @Operation(summary = "Get user profile", description = "Retrieves the authenticated user's profile")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<User> getUserProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/profile")
    @Operation(summary = "Update user profile", description = "Updates the authenticated user's profile")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<User> updateUserProfile(
            @Valid @RequestBody UserDto userDto,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        User updatedUser = userService.updateUser(user.getId(), userDto);
        return ResponseEntity.ok(updatedUser);
    }
    
    @DeleteMapping("/profile")
    @Operation(summary = "Delete user account", description = "Deactivates the authenticated user's account")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> deleteUserAccount(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        userService.deleteUser(user.getId());
        return ResponseEntity.noContent().build();
    }
}
