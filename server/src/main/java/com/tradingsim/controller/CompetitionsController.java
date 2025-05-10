package com.tradingsim.controller;

import com.tradingsim.model.Competition;
import com.tradingsim.model.User;
import com.tradingsim.repository.CompetitionRepository;
import com.tradingsim.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/competitions")
public class CompetitionsController {
    
    @Autowired
    private CompetitionRepository competitionRepository;
    
    @GetMapping
    public ResponseEntity<?> getAllCompetitions() {
        List<Competition> competitions = competitionRepository.findAll();
        return ResponseEntity.ok(competitions);
    }
    
    @GetMapping("/active")
    public ResponseEntity<?> getActiveCompetitions() {
        List<Competition> activeCompetitions = competitionRepository.findByActiveTrue();
        return ResponseEntity.ok(activeCompetitions);
    }
    
    @PostMapping("/{id}/join")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> joinCompetition(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Successfully joined competition");
        
        // In a real implementation, you would add the user to the competition
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/leaderboard")
    public ResponseEntity<?> getCompetitionLeaderboard(@PathVariable Long id) {
        // In a real application, you would query the database
        // For now, return sample data that matches the frontend expectations
        List<Map<String, Object>> leaderboard = new ArrayList<>();
        
        leaderboard.add(createLeaderboardEntry(1, "Rahul Sharma", "Mumbai", "₹168,345", "+16.8%"));
        leaderboard.add(createLeaderboardEntry(2, "Priya Patel", "Bangalore", "₹152,780", "+15.2%"));
        leaderboard.add(createLeaderboardEntry(3, "Arun Kumar", "Delhi", "₹143,670", "+14.3%"));
        leaderboard.add(createLeaderboardEntry(4, "Sneha Reddy", "Hyderabad", "₹132,450", "+13.2%"));
        leaderboard.add(createLeaderboardEntry(5, "Vikram Singh", "Chennai", "₹124,600", "+12.4%"));
        leaderboard.add(createLeaderboardEntry(6, "Neha Gupta", "Pune", "₹118,970", "+11.9%"));
        leaderboard.add(createLeaderboardEntry(7, "Rajesh Verma", "Kolkata", "₹106,550", "+10.6%"));
        leaderboard.add(createLeaderboardEntry(8, "Ananya Das", "Ahmedabad", "₹97,890", "+9.8%"));
        leaderboard.add(createLeaderboardEntry(9, "Suresh Menon", "Jaipur", "₹85,320", "+8.5%"));
        leaderboard.add(createLeaderboardEntry(10, "Meera Malhotra", "Lucknow", "₹76,750", "+7.6%"));
        
        return ResponseEntity.ok(leaderboard);
    }

    private Map<String, Object> createLeaderboardEntry(int rank, String name, String city, String profit, String roi) {
        Map<String, Object> entry = new HashMap<>();
        entry.put("rank", rank);
        entry.put("name", name);
        entry.put("city", city);
        entry.put("profit", profit);
        entry.put("roi", roi);
        return entry;
    }
}
