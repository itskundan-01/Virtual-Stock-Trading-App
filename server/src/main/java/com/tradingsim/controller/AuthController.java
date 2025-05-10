package com.tradingsim.controller;

import com.tradingsim.dto.request.LoginRequest;
import com.tradingsim.dto.request.RegisterRequest;
import com.tradingsim.dto.response.JwtResponse;
import com.tradingsim.dto.response.MessageResponse;
import com.tradingsim.model.ERole;
import com.tradingsim.model.Role;
import com.tradingsim.model.User;
import com.tradingsim.model.Wallet;
import com.tradingsim.repository.RoleRepository;
import com.tradingsim.repository.UserRepository;
import com.tradingsim.repository.WalletRepository;
import com.tradingsim.security.jwt.JwtUtils;
import com.tradingsim.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    WalletRepository walletRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getFirstName(),
                userDetails.getLastName(),
                roles,
                userDetails.isTwoFactorEnabled()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User();
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(encoder.encode(registerRequest.getPassword()));

        Set<Role> roles = new HashSet<>();
        
        // Assign default role of ROLE_USER to all new registrations
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        roles.add(userRole);
        
        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        
        // Create wallet for new user
        Wallet wallet = new Wallet();
        wallet.setUser(savedUser);
        wallet.setBalance(BigDecimal.valueOf(1000000)); // Starting balance of ₹10 lakh for new users
        walletRepository.save(wallet);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/register-first-admin")
    public ResponseEntity<?> registerFirstAdmin(@Valid @RequestBody RegisterRequest registerRequest, 
                                              @RequestParam String adminKey) {
        // Check if there are already users with ROLE_ADMIN
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("Error: Admin role is not found."));
        
        List<User> admins = userRepository.findAll().stream()
                .filter(user -> user.getRoles().contains(adminRole))
                .toList();
        
        if (!admins.isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Admin user already exists. Use the admin panel to create more admins."));
        }
        
        // Verify admin key against application property
        if (!adminKey.equals("MahaLakshyaAdmin2025Key!")) {
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
        roles.add(adminRole);
        
        // Also assign ROLE_USER to admins (so they can access user features too)
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: User role is not found."));
        roles.add(userRole);
        
        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        
        // Create wallet for new admin
        Wallet wallet = new Wallet();
        wallet.setUser(savedUser);
        wallet.setBalance(BigDecimal.valueOf(1000000)); // Starting balance of ₹10 lakh
        walletRepository.save(wallet);

        return ResponseEntity.ok(new MessageResponse("First admin registered successfully!"));
    }
}
