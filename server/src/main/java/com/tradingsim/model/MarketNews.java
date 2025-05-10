package com.tradingsim.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "market_news")
public class MarketNews {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String headline;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private String category;
    
    @Column(nullable = false)
    private LocalDateTime publishedAt;
}
