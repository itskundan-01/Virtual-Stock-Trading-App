package com.tradingsim.controller;

import com.tradingsim.model.User;
import com.tradingsim.repository.StockRepository;
import com.tradingsim.repository.TransactionRepository;
import com.tradingsim.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
}
