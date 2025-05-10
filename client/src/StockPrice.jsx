import React, { useState } from "react";
import { fetchStockDetails } from "./services/api";
import { toast } from 'react-toastify';
import './StockPrice.css';

const StockPrice = () => {
  const [stockName, setStockName] = useState("");
  const [stockDetails, setStockDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const popularIndianStocks = [
    { symbol: 'RELIANCE.BSE', name: 'Reliance Industries' },
    { symbol: 'TCS.BSE', name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK.BSE', name: 'HDFC Bank' },
    { symbol: 'INFY.BSE', name: 'Infosys' },
    { symbol: 'ICICIBANK.BSE', name: 'ICICI Bank' },
    { symbol: 'HINDUNILVR.BSE', name: 'Hindustan Unilever' },
    { symbol: 'SBIN.BSE', name: 'State Bank of India' },
    { symbol: 'BAJFINANCE.BSE', name: 'Bajaj Finance' },
    { symbol: 'BHARTIARTL.BSE', name: 'Bharti Airtel' },
    { symbol: 'KOTAKBANK.BSE', name: 'Kotak Mahindra Bank' },
  ];
  
  // US stocks for broader market coverage
  const popularGlobalStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
  ];

  // Format and standardize stock symbol
  const formatStockSymbol = (symbol) => {
    if (!symbol) return '';
    
    // If it already has an exchange suffix (.BSE or .NSE), keep it as is
    if (symbol.includes('.BSE') || symbol.includes('.NSE')) {
      return symbol;
    }
    
    // If it's a well-known US stock, don't add suffix
    const usStocks = ['AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'WMT'];
    if (usStocks.includes(symbol)) {
      return symbol;
    }
    
    // Otherwise, assume it's an Indian stock and add .BSE by default
    return `${symbol}.BSE`;
  };

  // Check if a stock symbol is international (US stock)
  const isInternationalStock = (symbol) => {
    const usStocks = ['AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'WMT'];
    return usStocks.includes(symbol) || 
           (symbol && !symbol.includes('.BSE') && !symbol.includes('.NSE'));
  };

  const handleFetchStock = async () => {
    if (!stockName.trim()) {
      toast.error('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError('');
    
    // Format the stock symbol (add .BSE if needed)
    const formattedSymbol = formatStockSymbol(stockName);

    try {
      const details = await fetchStockDetails(formattedSymbol);
      
      if (details) {
        setStockDetails(details);
        toast.success(`Successfully fetched details for ${details.name || formattedSymbol}`);
      } else {
        throw new Error('No stock data returned');
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      setError('Failed to fetch stock details. Please check the symbol and try again.');
      toast.error('Failed to fetch stock details');
      setStockDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (selectedSymbol, stockName) => {
    setStockName(selectedSymbol);
    // Fetch data immediately upon selection
    handleFetchStockWithSymbol(selectedSymbol, stockName);
  };
  
  const handleFetchStockWithSymbol = async (symbol, name) => {
    setLoading(true);
    setError('');

    try {
      const details = await fetchStockDetails(symbol);
      
      if (details) {
        // If AlphaVantage didn't return a name (common with Global Quote), use the provided name
        if (details.name === symbol && name) {
          details.name = name;
        }
        setStockDetails(details);
        toast.success(`Successfully fetched details for ${details.name || symbol}`);
      } else {
        throw new Error('No stock data returned');
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      setError('Failed to fetch stock details. Please check the symbol and try again.');
      toast.error('Failed to fetch stock details');
      setStockDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Format a number as currency with appropriate currency symbol
  const formatCurrency = (value, symbol) => {
    const isIntl = isInternationalStock(symbol);
    
    return parseFloat(value).toLocaleString(isIntl ? 'en-US' : 'en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  return (
    <div className="stock-price-container">
      <h2>Stock Price Lookup</h2>
      <p className="helper-text">Enter a stock symbol (e.g., RELIANCE, AAPL)</p>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Stock Symbol"
          value={stockName}
          onChange={(e) => setStockName(e.target.value.toUpperCase())}
          className="stock-input"
        />
        <button onClick={handleFetchStock} className="fetch-btn" disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Price'}
        </button>
      </div>
      
      {error && <p className="error-message">{error}</p>}
      
      {stockDetails && (
        <div className="price-result">
          <h3>{stockDetails.name}</h3>
          <div className="price-value">
            {isInternationalStock(stockDetails.symbol) ? '$' : '₹'} {formatCurrency(stockDetails.price, stockDetails.symbol)}
          </div>
          
          <div className="price-change">
            <span className={stockDetails.change >= 0 ? "positive" : "negative"}>
              {stockDetails.change >= 0 ? '+' : ''}
              {isInternationalStock(stockDetails.symbol) ? '$' : '₹'} {formatCurrency(stockDetails.change, stockDetails.symbol)} 
              ({stockDetails.change >= 0 ? '+' : ''}
              {typeof stockDetails.changePercent === 'number' 
                ? stockDetails.changePercent.toFixed(2) 
                : '0.00'}%)
            </span>
          </div>
          
          {stockDetails.previousClose && (
            <div className="additional-info">
              <div>Previous Close: {isInternationalStock(stockDetails.symbol) ? '$' : '₹'} {formatCurrency(stockDetails.previousClose, stockDetails.symbol)}</div>
            </div>
          )}
          
          {stockDetails.description && (
            <div className="stock-description">
              <h4>About {stockDetails.name}</h4>
              <p>{stockDetails.description}</p>
              {stockDetails.sector && <div><strong>Sector:</strong> {stockDetails.sector}</div>}
              {stockDetails.industry && <div><strong>Industry:</strong> {stockDetails.industry}</div>}
            </div>
          )}
          
          <div className="last-updated">
            Last updated: {new Date(stockDetails.lastUpdated).toLocaleString('en-IN')}
          </div>
        </div>
      )}
      
      <div className="popular-stocks">
        <h3>Popular Indian Stocks</h3>
        <div className="stock-chips">
          {popularIndianStocks.map((stock) => (
            <div 
              key={stock.symbol} 
              className="stock-chip" 
              onClick={() => handleQuickSelect(stock.symbol, stock.name)}
            >
              {stock.symbol.split('.')[0]}
              <span className="stock-name">{stock.name}</span>
            </div>
          ))}
        </div>
        
        <h3>Popular Global Stocks</h3>
        <div className="stock-chips">
          {popularGlobalStocks.map((stock) => (
            <div 
              key={stock.symbol} 
              className="stock-chip" 
              onClick={() => handleQuickSelect(stock.symbol, stock.name)}
            >
              {stock.symbol}
              <span className="stock-name">{stock.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="exchange-info">
        <p><strong>Note on Stock Symbols:</strong></p>
        <p>• Indian stock symbols are automatically appended with .BSE (Bombay Stock Exchange)</p>
        <p>• For NSE trading, manually add .NSE after the symbol (e.g., TATAMOTORS.NSE)</p>
        <p>• US stocks can be searched directly by their symbol (e.g., AAPL, MSFT)</p>
      </div>
    </div>
  );
};

export default StockPrice;