package com.tradingsim.config;

import com.tradingsim.model.ERole;
import com.tradingsim.model.Role;
import com.tradingsim.model.Stock;
import com.tradingsim.model.Tutorial;
import com.tradingsim.repository.RoleRepository;
import com.tradingsim.repository.StockRepository;
import com.tradingsim.repository.TutorialRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseInitializer {

    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private StockRepository stockRepository;
    
    @Autowired
    private TutorialRepository tutorialRepository;  // Added missing repository

    @PostConstruct
    public void initialize() {
        initRoles();
        initStocks();
        initTutorials();
    }
    
    private void initRoles() {
        // Create default roles if they don't exist
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(ERole.ROLE_USER));
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
            System.out.println("Roles initialized");
        }
    }
    
    private void initStocks() {
        // Only initialize if no stocks exist
        if (stockRepository.count() == 0) {
            List<Stock> defaultStocks = Arrays.asList(
                createStock("RELIANCE", "Reliance Industries Ltd", 2875.40, 2850.75),
                createStock("TCS", "Tata Consultancy Services", 3720.25, 3680.50),
                createStock("HDFCBANK", "HDFC Bank Ltd", 1650.30, 1640.25),
                createStock("INFY", "Infosys Ltd", 1480.75, 1510.50),
                createStock("BHARTIARTL", "Bharti Airtel Ltd", 910.25, 905.60),
                createStock("ICICIBANK", "ICICI Bank Ltd", 875.40, 865.20),
                createStock("ITC", "ITC Ltd", 440.15, 437.50),
                createStock("SBIN", "State Bank of India", 630.75, 625.30),
                createStock("WIPRO", "Wipro Ltd", 480.25, 488.75),
                createStock("HCLTECH", "HCL Technologies Ltd", 1450.60, 1435.25),
                createStock("TATASTEEL", "Tata Steel Ltd", 140.50, 138.25),
                createStock("TATAMOTORS", "Tata Motors Ltd", 860.40, 835.75),
                createStock("MARUTI", "Maruti Suzuki India Ltd", 11250.30, 11200.75),
                createStock("ADANIPORTS", "Adani Ports & SEZ Ltd", 875.60, 865.25),
                createStock("SUNPHARMA", "Sun Pharmaceutical Industries", 1180.35, 1170.50),
                createStock("DRREDDY", "Dr. Reddy's Laboratories", 5430.75, 5390.25),
                createStock("ASIANPAINT", "Asian Paints Ltd", 3280.45, 3260.80),
                createStock("BAJFINANCE", "Bajaj Finance Ltd", 7150.25, 7120.50),
                createStock("AXISBANK", "Axis Bank Ltd", 1030.60, 1020.75),
                createStock("KOTAKBANK", "Kotak Mahindra Bank Ltd", 1740.35, 1730.25)
            );
            
            stockRepository.saveAll(defaultStocks);
            System.out.println("Sample stocks initialized");
        }
    }
    
    private Stock createStock(String symbol, String name, double currentPrice, double previousClose) {
        Stock stock = new Stock();
        stock.setSymbol(symbol);
        stock.setName(name);
        stock.setCurrentPrice(BigDecimal.valueOf(currentPrice));
        stock.setPreviousClose(BigDecimal.valueOf(previousClose));
        stock.setOpenPrice(BigDecimal.valueOf(previousClose * (1 + (Math.random() * 0.02 - 0.01))));
        stock.setDayHigh(BigDecimal.valueOf(Math.max(currentPrice, previousClose) * (1 + Math.random() * 0.01)));
        stock.setDayLow(BigDecimal.valueOf(Math.min(currentPrice, previousClose) * (1 - Math.random() * 0.01)));
        stock.setVolume(Long.valueOf((int)(Math.random() * 10000000 + 1000000)));
        stock.setLastUpdated(LocalDateTime.now());
        return stock;
    }

    private void initTutorials() {
        // Only initialize if no tutorials exist
        if (tutorialRepository.count() == 0) {
            List<Tutorial> defaultTutorials = Arrays.asList(
                createTutorial(
                    "Understanding Indian Stock Market Basics", 
                    "beginner",
                    "Learn the fundamentals of the Indian stock market, including key exchanges, indices, and trading mechanisms.",
                    "<h4>Introduction to Indian Stock Markets</h4>" +
                    "<p>India has two major stock exchanges:</p>" +
                    "<ul>" +
                    "<li><strong>National Stock Exchange (NSE)</strong> - India's largest stock exchange by trading volume</li>" +
                    "<li><strong>Bombay Stock Exchange (BSE)</strong> - Asia's oldest stock exchange, established in 1875</li>" +
                    "</ul>" +
                    "<p>Key indices that track market performance include:</p>" +
                    "<ul>" +
                    "<li>NIFTY 50 (NSE's benchmark index comprising 50 large companies)</li>" +
                    "<li>SENSEX (BSE's benchmark comprising 30 large companies)</li>" +
                    "<li>NIFTY Bank, NIFTY IT, and other sector-specific indices</li>" +
                    "</ul>" +
                    "<h4>Trading Hours</h4>" +
                    "<p>The standard trading session runs from 9:15 AM to 3:30 PM, Monday to Friday (except market holidays).</p>",
                    "15 minutes",
                    "Beginner"
                ),
                createTutorial(
                    "SEBI Regulations for Retail Investors", 
                    "beginner",
                    "Understand the key regulations set by the Securities and Exchange Board of India (SEBI) that affect retail investors.",
                    "<h4>About SEBI</h4>" +
                    "<p>The Securities and Exchange Board of India (SEBI) is the regulatory body for securities and commodity markets in India, established in 1988 and given statutory powers in 1992.</p>" +
                    "<h4>Key Regulations</h4>" +
                    "<ul>" +
                    "<li><strong>Margin Requirements</strong> - For intraday trading and F&O segments</li>" +
                    "<li><strong>Circuit Limits</strong> - Price bands to prevent excessive volatility</li>" +
                    "<li><strong>Lot Sizes</strong> - Standardized contract sizes for derivatives</li>" +
                    "<li><strong>KYC Requirements</strong> - Documentation needed to open trading accounts</li>" +
                    "</ul>",
                    "20 minutes",
                    "Beginner"
                ),
                createTutorial(
                    "Demat and Trading Accounts in India", 
                    "beginner",
                    "Learn about the Demat account system unique to India and how it works with your trading account.",
                    "<h4>Demat Account Structure</h4>" +
                    "<p>In India, securities are held electronically in a Dematerialized (Demat) account, which is maintained by depositories like NSDL and CDSL.</p>" +
                    "<h4>Account Requirements</h4>" +
                    "<ul>" +
                    "<li><strong>Demat Account</strong> - For holding securities electronically</li>" +
                    "<li><strong>Trading Account</strong> - For executing buy/sell orders</li>" +
                    "<li><strong>Bank Account</strong> - Linked for fund transfers</li>" +
                    "</ul>" +
                    "<h4>3-in-1 Accounts</h4>" +
                    "<p>Many brokers offer integrated 3-in-1 accounts that combine Demat, trading and banking services for seamless operations.</p>",
                    "18 minutes",
                    "Beginner"
                ),
                createTutorial(
                    "Technical Analysis for Indian Markets", 
                    "intermediate",
                    "Apply technical analysis principles specifically to Indian stocks and indices.",
                    "<h4>Technical Indicators for Indian Markets</h4>" +
                    "<p>While universal technical analysis principles apply, there are nuances when applying them to Indian markets:</p>" +
                    "<ul>" +
                    "<li><strong>Volume Analysis</strong> - Understanding F&O expiry effects on volume patterns</li>" +
                    "<li><strong>Support/Resistance</strong> - Key psychological levels in Indian indices (Nifty at 20000, 22000, etc.)</li>" +
                    "<li><strong>Moving Averages</strong> - The 50-day and 200-day EMAs have shown particular significance</li>" +
                    "</ul>" +
                    "<h4>Candlestick Patterns</h4>" +
                    "<p>Learn how patterns like Doji, Hammer, and Engulfing patterns have performed historically in Nifty and key stocks.</p>",
                    "30 minutes",
                    "Intermediate"
                ),
                createTutorial(
                    "F&O Trading in Indian Markets", 
                    "advanced",
                    "Master futures and options trading specific to NSE's derivative segment.",
                    "<h4>NSE F&O Segment</h4>" +
                    "<p>The NSE's F&O segment offers equity derivatives, index derivatives, and currency derivatives.</p>" +
                    "<h4>Contract Specifications</h4>" +
                    "<ul>" +
                    "<li><strong>Lot Sizes</strong> - Understanding standardized contract sizes</li>" +
                    "<li><strong>Expiry Cycles</strong> - Weekly and monthly expiry structure</li>" +
                    "<li><strong>Settlement</strong> - Cash-settled vs. physically-settled derivatives</li>" +
                    "</ul>" +
                    "<h4>Option Strategies for Indian Markets</h4>" +
                    "<p>Learn strategies that work well in the Indian volatility environment, like Iron Condors during range-bound markets and straddles before major events.</p>",
                    "45 minutes",
                    "Advanced"
                )
            );
            
            tutorialRepository.saveAll(defaultTutorials);
            System.out.println("Default tutorials initialized");
        }
    }

    private Tutorial createTutorial(String title, String category, String description, String content, String duration, String level) {
        Tutorial tutorial = new Tutorial();
        tutorial.setTitle(title);
        tutorial.setCategory(category);
        tutorial.setDescription(description);
        tutorial.setContent(content);
        tutorial.setDuration(duration);
        tutorial.setLevel(level);
        return tutorial;
    }
}
