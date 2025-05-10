package com.tradingsim.controller;

import com.tradingsim.model.MarketNews;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/market-news")
public class MarketNewsController {

    @GetMapping
    public ResponseEntity<?> getMarketNews() {
        // In a real application, this would fetch from a database or external API
        // For now, we'll return sample data
        List<MarketNews> news = new ArrayList<>();
        
        news.add(createNews(
            "RBI Maintains Repo Rate at 6.5% for the Seventh Consecutive Time",
            "The Reserve Bank of India's Monetary Policy Committee decided to keep the repo rate unchanged at 6.5% with a unanimous vote, focusing on inflation management.",
            "Economy",
            LocalDateTime.now().minusHours(1)
        ));
        
        news.add(createNews(
            "IT Sector Faces Headwinds as Global Tech Spending Slows",
            "Major Indian IT companies are experiencing growth challenges as clients in the US and Europe cut technology spending amid economic uncertainty.",
            "Technology",
            LocalDateTime.now().minusHours(3)
        ));
        
        news.add(createNews(
            "Auto Sales Show Strong Recovery in Q2",
            "Indian automobile manufacturers reported robust sales growth in the second quarter, driven by strong demand for SUVs and premium vehicles.",
            "Automobiles",
            LocalDateTime.now().minusHours(5)
        ));
        
        news.add(createNews(
            "Reliance Industries Plans Major Expansion in Renewable Energy",
            "Reliance Industries has announced plans to invest ₹75,000 crore in green energy initiatives over the next five years.",
            "Energy",
            LocalDateTime.now().minusHours(8)
        ));
        
        news.add(createNews(
            "Pharmaceutical Exports Rise by 8% Year-on-Year",
            "Indian pharmaceutical exports have shown steady growth, continuing the momentum from post-pandemic recovery.",
            "Healthcare",
            LocalDateTime.now().minusDays(1)
        ));
        
        news.add(createNews(
            "Government Announces PLI Scheme for Electronics Manufacturing",
            "The Production Linked Incentive scheme aims to boost domestic manufacturing and reduce dependence on imports.",
            "Policy",
            LocalDateTime.now().minusDays(1).minusHours(5)
        ));
        
        return ResponseEntity.ok(news);
    }
    
    private MarketNews createNews(String headline, String content, String category, LocalDateTime publishedAt) {
        MarketNews news = new MarketNews();
        news.setId((long) (Math.random() * 1000));
        news.setHeadline(headline);
        news.setContent(content);
        news.setCategory(category);
        news.setPublishedAt(publishedAt);
        return news;
    }
}
