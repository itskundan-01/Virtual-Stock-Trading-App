package com.tradingsim.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
public class JwtResponse {
    private String accessToken;  // This is the field name the frontend expects

    @JsonProperty("user")
    private Map<String, Object> user;  // Contains user information

    private String type = "Bearer";
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private List<String> roles;
    private boolean twoFactorEnabled;

    public JwtResponse(String accessToken, Long id, String email, String firstName, String lastName, List<String> roles, boolean twoFactorEnabled) {
        this.accessToken = accessToken;
        
        // Create user object expected by frontend
        this.user = new HashMap<>();
        user.put("id", id);
        user.put("email", email);
        user.put("name", firstName + " " + lastName);
        user.put("isAdmin", roles.contains("ROLE_ADMIN"));
        user.put("twoFactorEnabled", twoFactorEnabled);
        
        // Keep original fields too
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.roles = roles;
        this.twoFactorEnabled = twoFactorEnabled;
    }
}
