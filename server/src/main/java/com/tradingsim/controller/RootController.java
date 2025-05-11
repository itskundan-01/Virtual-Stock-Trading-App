package com.tradingsim.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<?> rootEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("service", "Mahalaxya Trading Simulator API");
        response.put("version", "1.0.0");
        response.put("message", "Welcome to Mahalaxya API. Use /api endpoints to access API features.");
        
        return ResponseEntity.ok(response);
    }
}