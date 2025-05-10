package com.tradingsim.controller;

import com.tradingsim.model.Transaction;
import com.tradingsim.model.User;
import com.tradingsim.model.Wallet;
import com.tradingsim.repository.TransactionRepository;
import com.tradingsim.repository.UserRepository;
import com.tradingsim.repository.WalletRepository;
import com.tradingsim.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/wallet")
public class WalletController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private WalletRepository walletRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @GetMapping("/balance")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getWalletBalance() {
        User user = getCurrentUser();
        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Error: Wallet not found for user"));
        
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("balance", wallet.getBalance());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/transactions")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getTransactions() {
        User user = getCurrentUser();
        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Error: Wallet not found for user"));
        
        List<Transaction> transactions = transactionRepository.findByWalletOrderByCreatedAtDesc(wallet);
        
        return ResponseEntity.ok(transactions);
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User is not found."));
    }
}
