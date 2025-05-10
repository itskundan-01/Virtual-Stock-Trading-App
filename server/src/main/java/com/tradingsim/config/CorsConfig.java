package com.tradingsim.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {
    
    @Value("${cors.allowed-origins}")
    private String allowedOrigins;
    
    @Value("${cors.allowed-methods}")
    private String allowedMethods;
    
    @Value("${cors.allowed-headers}")
    private String allowedHeaders;
    
    @Value("${cors.exposed-headers}")
    private String exposedHeaders;

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        
        // Parse comma-separated values from properties
        for (String origin : allowedOrigins.split(",")) {
            config.addAllowedOrigin(origin.trim());
        }
        
        for (String method : allowedMethods.split(",")) {
            config.addAllowedMethod(method.trim());
        }
        
        for (String header : allowedHeaders.split(",")) {
            config.addAllowedHeader(header.trim());
        }
        
        for (String header : exposedHeaders.split(",")) {
            config.addExposedHeader(header.trim());
        }
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
