package com.tradingsim.controller;

import com.tradingsim.dto.response.MessageResponse;
import com.tradingsim.model.User;
import com.tradingsim.repository.UserRepository;
import com.tradingsim.security.services.UserDetailsImpl;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/2fa")
public class TwoFactorAuthController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/generate")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> generate2FA() throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User is not found."));
        
        if (user.isTwoFactorEnabled()) {
            return ResponseEntity.badRequest().body(new MessageResponse("2FA is already enabled for this account"));
        }
        
        // Generate secret key
        SecretGenerator secretGenerator = new DefaultSecretGenerator();
        String secret = secretGenerator.generate();
        
        // Create QR code data
        QrData data = new QrData.Builder()
                .label(user.getEmail())
                .secret(secret)
                .issuer("Trading Simulator")
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();
        
        // Generate QR code
        QrGenerator qrGenerator = new ZxingPngQrGenerator();
        byte[] qrCodeImage = qrGenerator.generate(data);
        String qrCodeBase64 = Base64.getEncoder().encodeToString(qrCodeImage);
        
        // Save secret to user
        user.setTwoFactorSecret(secret);
        userRepository.save(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("qrCode", "data:image/png;base64," + qrCodeBase64);
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/verify")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> verify2FA(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Token is required"));
        }
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User is not found."));
        
        String secret = user.getTwoFactorSecret();
        if (secret == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: 2FA has not been set up"));
        }
        
        // Verify token
        CodeVerifier verifier = new DefaultCodeVerifier(null, new SystemTimeProvider());
        if (verifier.isValidCode(secret, token)) {
            user.setTwoFactorEnabled(true);
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("2FA has been successfully enabled"));
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid token"));
        }
    }
}
