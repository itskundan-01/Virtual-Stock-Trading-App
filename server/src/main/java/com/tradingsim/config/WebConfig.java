package com.tradingsim.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Add other redirects if needed for frontend compatibility
        registry.addRedirectViewController("/stocks/price/**", "/api/stocks/price/**");
        registry.addRedirectViewController("/forum/**", "/api/forum/**");
    }
}
