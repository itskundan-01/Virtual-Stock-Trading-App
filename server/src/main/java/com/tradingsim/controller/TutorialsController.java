package com.tradingsim.controller;

import com.tradingsim.model.Tutorial;
import com.tradingsim.repository.TutorialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tutorials")
public class TutorialsController {

    @Autowired
    private TutorialRepository tutorialRepository;

    @GetMapping
    public ResponseEntity<?> getAllTutorials() {
        List<Tutorial> tutorials = tutorialRepository.findAll();
        return ResponseEntity.ok(tutorials);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getTutorialById(@PathVariable Long id) {
        Optional<Tutorial> tutorial = tutorialRepository.findById(id);
        
        if (tutorial.isPresent()) {
            return ResponseEntity.ok(tutorial.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Tutorial not found with id: " + id);
            return ResponseEntity.status(404).body(response);
        }
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<?> getTutorialsByCategory(@PathVariable String category) {
        List<Tutorial> tutorials;
        
        if ("all".equalsIgnoreCase(category)) {
            tutorials = tutorialRepository.findAll();
        } else {
            tutorials = tutorialRepository.findByCategory(category.toLowerCase());
        }
        
        return ResponseEntity.ok(tutorials);
    }
}
