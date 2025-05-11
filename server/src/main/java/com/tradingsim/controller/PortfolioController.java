package com.tradingsim.controller;

import com.tradingsim.model.Portfolio;
import com.tradingsim.model.Trade;
import com.tradingsim.model.User;
import com.tradingsim.repository.PortfolioRepository;
import com.tradingsim.repository.TradeRepository;
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

@CrossOrigin(origins = {"http://localhost:5000", "http://127.0.0.1:5000"}, maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {
    
    @Autowired
    private PortfolioRepository portfolioRepository;
    
    @Autowired
    private TradeRepository tradeRepository;
    
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getUserPortfolio() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = new User();
        user.setId(userDetails.getId());
        
        List<Portfolio> holdings = portfolioRepository.findByUser(user);
        
        // Calculate portfolio summary
        BigDecimal totalInvestment = BigDecimal.ZERO;
        BigDecimal currentValue = BigDecimal.ZERO;
        
        for (Portfolio holding : holdings) {
            totalInvestment = totalInvestment.add(holding.getTotalInvestment());
            currentValue = currentValue.add(holding.getCurrentValue());
        }
        
        BigDecimal profitLoss = currentValue.subtract(totalInvestment);
        BigDecimal profitLossPercentage = BigDecimal.ZERO;
        if (totalInvestment.compareTo(BigDecimal.ZERO) > 0) {
            profitLossPercentage = profitLoss.divide(totalInvestment, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("holdings", holdings);
        response.put("summary", Map.of(
            "totalInvestment", totalInvestment,
            "currentValue", currentValue,
            "profitLoss", profitLoss,
            "profitLossPercentage", profitLossPercentage
        ));
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/trades")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getUserTrades() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = new User();
        user.setId(userDetails.getId());
        
        List<Trade> trades = tradeRepository.findByUserOrderByDateDesc(user);
        
        return ResponseEntity.ok(trades);
    }
}
