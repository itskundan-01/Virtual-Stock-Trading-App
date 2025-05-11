package com.tradingsim.controller;

import com.tradingsim.dto.request.TradeRequest;
import com.tradingsim.dto.response.MessageResponse;
import com.tradingsim.model.Trade;
import com.tradingsim.model.User;
import com.tradingsim.repository.TradeRepository;
import com.tradingsim.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:5000", "http://127.0.0.1:5000"}, maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/trades")
public class TradesController {

    @Autowired
    private TradeRepository tradeRepository;
    
    @Autowired
    private TradeController tradeController;  // Delegate to our main implementation
    
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getAllTrades() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = new User();
        user.setId(userDetails.getId());
        
        List<Trade> trades = tradeRepository.findByUserOrderByDateDesc(user);
        
        return ResponseEntity.ok(trades);
    }
    
    @PostMapping("/buy")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> buyStock(@Valid @RequestBody TradeRequest tradeRequest) {
        // Ensure this is a buy request
        tradeRequest.setType("BUY");
        return tradeController.executeTrade(tradeRequest);
    }
    
    @PostMapping("/sell")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> sellStock(@Valid @RequestBody TradeRequest tradeRequest) {
        // Ensure this is a sell request
        tradeRequest.setType("SELL");
        return tradeController.executeTrade(tradeRequest);
    }
}
