package com.tradingsim.controller;

import com.tradingsim.dto.request.TradeRequest;
import com.tradingsim.dto.response.MessageResponse;
import com.tradingsim.model.*;
import com.tradingsim.repository.*;
import com.tradingsim.security.services.UserDetailsImpl;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:5000", "http://127.0.0.1:5000"}, maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/trade")
public class TradeController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private WalletRepository walletRepository;
    
    @Autowired
    private TradeRepository tradeRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private PortfolioRepository portfolioRepository;
    
    @Autowired
    private StockRepository stockRepository;
    
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    @Transactional
    public ResponseEntity<?> executeTrade(@Valid @RequestBody TradeRequest tradeRequest) {
        User user = getCurrentUser();
        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Error: Wallet not found for user"));
        
        // Validate stock
        Stock stock = stockRepository.findBySymbol(tradeRequest.getSymbol())
                .orElseThrow(() -> new RuntimeException("Error: Stock not found"));
        
        BigDecimal tradeAmount = stock.getCurrentPrice().multiply(BigDecimal.valueOf(tradeRequest.getQuantity()));
        
        if (tradeRequest.getType().equals(Trade.TradeType.BUY.toString())) {
            // Check if user has enough balance
            if (wallet.getBalance().compareTo(tradeAmount) < 0) {
                return ResponseEntity.badRequest().body(new MessageResponse("Insufficient balance for this trade"));
            }
            
            // Update wallet
            wallet.setBalance(wallet.getBalance().subtract(tradeAmount));
            walletRepository.save(wallet);
            
            // Record transaction
            Transaction transaction = new Transaction();
            transaction.setWallet(wallet);
            transaction.setType(Transaction.TransactionType.TRADE_BUY);
            transaction.setAmount(tradeAmount);
            transaction.setDescription("Bought " + tradeRequest.getQuantity() + " " + tradeRequest.getSymbol() + " shares");
            transaction.setBalanceAfter(wallet.getBalance());
            transactionRepository.save(transaction);
            
            // Update or create portfolio entry
            Portfolio portfolio = portfolioRepository.findByUserAndStockSymbol(user, tradeRequest.getSymbol())
                    .orElse(new Portfolio());
            
            if (portfolio.getId() == null) {
                portfolio.setUser(user);
                portfolio.setStockSymbol(tradeRequest.getSymbol());
                portfolio.setStockName(stock.getName());
                portfolio.setQuantity(tradeRequest.getQuantity());
                portfolio.setAverageBuyPrice(stock.getCurrentPrice());
                portfolio.setTotalInvestment(tradeAmount);
            } else {
                // Calculate new average buy price
                int newQuantity = portfolio.getQuantity() + tradeRequest.getQuantity();
                BigDecimal newTotalInvestment = portfolio.getTotalInvestment().add(tradeAmount);
                @SuppressWarnings("deprecation")
                BigDecimal newAverageBuyPrice = newTotalInvestment.divide(BigDecimal.valueOf(newQuantity), 2, BigDecimal.ROUND_HALF_UP);
                
                portfolio.setQuantity(newQuantity);
                portfolio.setAverageBuyPrice(newAverageBuyPrice);
                portfolio.setTotalInvestment(newTotalInvestment);
            }
            
            portfolio.setCurrentValue(stock.getCurrentPrice().multiply(BigDecimal.valueOf(portfolio.getQuantity())));
            portfolio.setProfitLoss(portfolio.getCurrentValue().subtract(portfolio.getTotalInvestment()));
            portfolioRepository.save(portfolio);
            
        } else if (tradeRequest.getType().equals(Trade.TradeType.SELL.toString())) {
            // Check if user owns the stock and has enough quantity
            Portfolio portfolio = portfolioRepository.findByUserAndStockSymbol(user, tradeRequest.getSymbol())
                    .orElseThrow(() -> new RuntimeException("Error: You don't own this stock"));
            
            if (portfolio.getQuantity() < tradeRequest.getQuantity()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Not enough shares to sell"));
            }
            
            // Update wallet
            wallet.setBalance(wallet.getBalance().add(tradeAmount));
            walletRepository.save(wallet);
            
            // Record transaction
            Transaction transaction = new Transaction();
            transaction.setWallet(wallet);
            transaction.setType(Transaction.TransactionType.TRADE_SELL);
            transaction.setAmount(tradeAmount);
            transaction.setDescription("Sold " + tradeRequest.getQuantity() + " " + tradeRequest.getSymbol() + " shares");
            transaction.setBalanceAfter(wallet.getBalance());
            transactionRepository.save(transaction);
            
            // Update portfolio
            int newQuantity = portfolio.getQuantity() - tradeRequest.getQuantity();
            if (newQuantity == 0) {
                portfolioRepository.delete(portfolio);
            } else {
                // Adjust total investment and average buy price proportionally
                BigDecimal soldInvestment = portfolio.getAverageBuyPrice().multiply(BigDecimal.valueOf(tradeRequest.getQuantity()));
                portfolio.setTotalInvestment(portfolio.getTotalInvestment().subtract(soldInvestment));
                portfolio.setQuantity(newQuantity);
                portfolio.setCurrentValue(stock.getCurrentPrice().multiply(BigDecimal.valueOf(newQuantity)));
                portfolio.setProfitLoss(portfolio.getCurrentValue().subtract(portfolio.getTotalInvestment()));
                portfolioRepository.save(portfolio);
            }
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid trade type"));
        }
        
        // Record trade
        Trade trade = new Trade();
        trade.setUser(user);
        trade.setStockSymbol(tradeRequest.getSymbol());
        trade.setType(Trade.TradeType.valueOf(tradeRequest.getType()));
        trade.setQuantity(tradeRequest.getQuantity());
        trade.setPrice(stock.getCurrentPrice());
        trade.setDate(LocalDateTime.now());
        tradeRepository.save(trade);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Trade executed successfully");
        response.put("walletBalance", wallet.getBalance());
        
        return ResponseEntity.ok(response);
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User is not found."));
    }
}
