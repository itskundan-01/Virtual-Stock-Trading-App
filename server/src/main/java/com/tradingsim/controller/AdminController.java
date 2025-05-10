package com.tradingsim.controller;

import com.tradingsim.dto.request.AdminRegisterRequest;
import com.tradingsim.dto.response.MessageResponse;
import com.tradingsim.model.ERole;
import com.tradingsim.model.Role;
import com.tradingsim.model.User;
import com.tradingsim.repository.RoleRepository;
import com.tradingsim.repository.StockRepository;
import com.tradingsim.repository.TransactionRepository;
import com.tradingsim.repository.UserRepository;
import com.tradingsim.repository.WalletRepository;
import com.tradingsim.model.Wallet;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StockRepository stockRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private WalletRepository walletRepository;
    
    @Autowired
    private PasswordEncoder encoder;
    
    @Value("${admin.registration.key}")
    private String adminRegistrationKey;
    
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardData() {
        // Get total counts for admin dashboard
        long userCount = userRepository.count();
        long stockCount = stockRepository.count();
        long transactionCount = transactionRepository.count();
        
        Map<String, Object> dashboardData = new HashMap<>();
        dashboardData.put("userCount", userCount);
        dashboardData.put("stockCount", stockCount);
        dashboardData.put("transactionCount", transactionCount);
        
        return ResponseEntity.ok(dashboardData);
    }
    
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        // Remove sensitive info before sending
        users.forEach(user -> {
            user.setPassword(null);
            user.setTwoFactorSecret(null);
        });
        
        return ResponseEntity.ok(users);
    }
    
    @PostMapping("/users/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // In a real app, you'd have an enabled/disabled field
        // For this demo, we'll just set a message
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "User status toggled successfully");
        response.put("userId", user.getId().toString());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody AdminRegisterRequest registerRequest) {
        // Verify the admin key
        if (!adminRegistrationKey.equals(registerRequest.getAdminKey())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Invalid admin registration key"));
        }
        
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new admin account
        User user = new User();
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(encoder.encode(registerRequest.getPassword()));

        Set<Role> roles = new HashSet<>();
        
        // Assign ROLE_ADMIN
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("Error: Admin role is not found."));
        roles.add(adminRole);
        
        // Also assign ROLE_USER to admins (so they can access user features too)
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: User role is not found."));
        roles.add(userRole);
        
        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        
        // Create wallet for new admin (same as regular users)
        Wallet wallet = new Wallet();
        wallet.setUser(savedUser);
        wallet.setBalance(BigDecimal.valueOf(1000000)); // Starting balance of ₹10 lakh
        walletRepository.save(wallet);

        return ResponseEntity.ok(new MessageResponse("Admin registered successfully!"));
    }
}
