package com.tradingsim.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@Entity
@Table(name = "portfolios")
public class Portfolio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String stockSymbol;
    
    @Column(nullable = false)
    private String stockName;
    
    @Column(nullable = false)
    private int quantity;
    
    @Column(nullable = false)
    private BigDecimal averageBuyPrice;
    
    @Column(nullable = false)
    private BigDecimal currentValue;
    
    private BigDecimal profitLoss;
    
    @Column(nullable = false)
    private BigDecimal totalInvestment;
}
