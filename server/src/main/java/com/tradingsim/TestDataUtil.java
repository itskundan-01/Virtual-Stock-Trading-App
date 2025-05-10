package com.tradingsim;

import com.tradingsim.model.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

public class TestDataUtil {

    public static User createTestUser() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setPassword("password");
        user.setFirstName("Test");
        user.setLastName("User");
        
        Set<Role> roles = new HashSet<>();
        roles.add(createUserRole());
        user.setRoles(roles);
        
        return user;
    }
    
    public static Role createUserRole() {
        Role role = new Role();
        role.setId(1L);
        role.setName(ERole.ROLE_USER);
        return role;
    }
    
    public static Stock createTestStock() {
        Stock stock = new Stock();
        stock.setId(1L);
        stock.setSymbol("TEST");
        stock.setName("Test Stock");
        stock.setCurrentPrice(BigDecimal.valueOf(100.50));
        stock.setPreviousClose(BigDecimal.valueOf(99.50));
        stock.setOpenPrice(BigDecimal.valueOf(99.75));
        stock.setDayHigh(BigDecimal.valueOf(101.25));
        stock.setDayLow(BigDecimal.valueOf(99.25));
        stock.setVolume(1000000L);
        stock.setLastUpdated(LocalDateTime.now());
        return stock;
    }
    
    public static Wallet createTestWallet(User user) {
        Wallet wallet = new Wallet();
        wallet.setId(1L);
        wallet.setUser(user);
        wallet.setBalance(BigDecimal.valueOf(1000000.00)); // 10 lakh rupees
        return wallet;
    }
    
    public static Portfolio createTestPortfolio(User user) {
        Portfolio portfolio = new Portfolio();
        portfolio.setId(1L);
        portfolio.setUser(user);
        portfolio.setStockSymbol("TEST");
        portfolio.setStockName("Test Stock");
        portfolio.setQuantity(10);
        portfolio.setAverageBuyPrice(BigDecimal.valueOf(95.00));
        portfolio.setCurrentValue(BigDecimal.valueOf(1005.00));
        portfolio.setProfitLoss(BigDecimal.valueOf(55.00));
        portfolio.setTotalInvestment(BigDecimal.valueOf(950.00));
        return portfolio;
    }
}
