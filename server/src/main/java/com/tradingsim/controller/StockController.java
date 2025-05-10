package com.tradingsim.controller;

import com.tradingsim.model.Stock;
import com.tradingsim.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/stocks")
public class StockController {
    
    @Autowired
    private StockRepository stockRepository;
    
    @GetMapping("/price/{symbol}")
    public ResponseEntity<?> getStockPrice(@PathVariable String symbol) {
        Optional<Stock> stockOpt = stockRepository.findBySymbol(symbol.toUpperCase());
        
        if (stockOpt.isPresent()) {
            Stock stock = stockOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("symbol", stock.getSymbol());
            response.put("name", stock.getName());
            response.put("price", stock.getCurrentPrice());
            response.put("previousClose", stock.getPreviousClose());
            response.put("change", stock.getCurrentPrice().subtract(stock.getPreviousClose()));
            response.put("changePercent", 
                stock.getCurrentPrice().subtract(stock.getPreviousClose())
                .divide(stock.getPreviousClose(), 4, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100)));
            response.put("lastUpdated", stock.getLastUpdated());
            
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Stock not found with symbol: " + symbol);
            return ResponseEntity.status(404).body(errorResponse);
        }
    }
    
    @GetMapping("/list")
    public ResponseEntity<?> getAllStocks() {
        List<Stock> stocks = stockRepository.findAll();
        return ResponseEntity.ok(stocks);
    }
}
