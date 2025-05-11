import axios from 'axios';
import { API_URL, API_BASE_URL, API_KEY, FINANCE_NEWS_API_URL, FINANCE_NEWS_API_KEY, ALPHA_VANTAGE_API_URL, ALPHA_VANTAGE_API_KEY, ENABLE_MOCK_DATA } from '../config';

// Create API client for backend API
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle common API errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error codes
    if (error.response) {
      if (error.response.status === 401) {
        console.log('Authentication error - you may need to log in again');
        // Could add automatic redirect to login here
      }
      console.error(`API Error (${error.response.status}):`, error.response.data);
    } else if (error.request) {
      console.error('Network Error - No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Create separate instance for Indian Stock API
const stockApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json'
  }
});

// Create instance for Finance News API
const financeNewsApi = axios.create({
  baseURL: FINANCE_NEWS_API_URL,
  headers: {
    'X-API-Key': FINANCE_NEWS_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Create AlphaVantage API client with proxy support for CORS issues
const alphaVantageApi = axios.create({
  baseURL: ALPHA_VANTAGE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;

// Stock market API functions
export const fetchNews = async (category = 'all') => {
  try {
    console.log('Fetching news, ENABLE_MOCK_DATA:', ENABLE_MOCK_DATA);
    
    // If mock data is enabled, return mock data immediately
    if (ENABLE_MOCK_DATA) {
      console.log('Using mock news data');
      return generateMockNewsData();
    }
    
    console.log('Attempting to fetch real news data from:', FINANCE_NEWS_API_URL);
    
    // Try finance API with proper error handling
    try {
      const response = await financeNewsApi.get('/news', {
        params: category !== 'all' ? { category } : {},
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Finance news API response status:', response.status);
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Got valid news array from finance API');
        return response.data.map(item => ({
          id: item.id || Math.random().toString(36).substring(2, 15),
          headline: item.title || item.headline || '',
          title: item.title || item.headline || '',
          content: item.content || item.description || '',
          summary: item.content || item.description || '',
          source: item.source || 'Finance News',
          publishedAt: item.publishedAt || item.date || new Date().toISOString(),
          category: item.category || 'general',
          url: item.url || null
        }));
      }
    } catch (newsApiError) {
      console.error('Error fetching from finance news API:', newsApiError);
    }
    
    // If we're here, the finance API failed - try the server API
    console.log('Finance news API failed, trying server API');
    try {
      const serverResponse = await api.get('/market-news');
      if (serverResponse && serverResponse.data) {
        console.log('Successfully fetched news from server API');
        return serverResponse.data;
      }
    } catch (serverError) {
      console.error('Server API news fetch failed:', serverError);
    }
    
    // Both APIs failed, use mock data
    console.log('All news API attempts failed, returning mock data');
    return generateMockNewsData();
  } catch (error) {
    console.error('Critical error in fetchNews:', error);
    return generateMockNewsData();
  }
};

// Enhanced stock details function with built-in CORS handling and fallbacks
export const fetchStockDetails = async (stockSymbol) => {
  try {
    console.log(`Fetching stock data for: ${stockSymbol}`);
    
    // If mock data is enabled, return mock data immediately
    if (ENABLE_MOCK_DATA) {
      console.log('Using mock stock data');
      return generateMockStockData(stockSymbol);
    }
    
    // First try AlphaVantage with a CORS proxy if needed
    try {
      const response = await alphaVantageApi.get('', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: stockSymbol,
          apikey: ALPHA_VANTAGE_API_KEY
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('AlphaVantage response received');
      
      if (response.data && response.data['Global Quote'] && Object.keys(response.data['Global Quote']).length > 0) {
        const quote = response.data['Global Quote'];
        
        return {
          symbol: quote['01. symbol'],
          name: quote['01. symbol'], // AlphaVantage doesn't provide company name in Global Quote
          price: parseFloat(quote['05. price']),
          previousClose: parseFloat(quote['08. previous close']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          lastUpdated: new Date().toISOString()
        };
      }
    } catch (alphaVantageError) {
      console.error('AlphaVantage API error:', alphaVantageError);
    }
    
    // If AlphaVantage failed, try our local API
    try {
      console.log('Using stock API fallback');
      const response = await stockApi.get('/stock', {
        params: { name: stockSymbol },
        headers: { 'x-api-key': API_KEY }
      });
      
      if (response.data) {
        return response.data;
      }
    } catch (stockApiError) {
      console.error('Stock API fallback failed:', stockApiError);
    }
    
    // All APIs failed, return mock data
    console.log('All stock API attempts failed, returning mock data');
    return generateMockStockData(stockSymbol);
  } catch (error) {
    console.error('Critical error in fetchStockDetails:', error);
    return generateMockStockData(stockSymbol);
  }
};

// Generate mock stock data for fallback
const generateMockStockData = (symbol) => {
  // Create a deterministic but seemingly random price based on symbol string
  const basePrice = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000 + 500;
  const price = basePrice + Math.random() * 50 - 25;
  const previousClose = price - (Math.random() * 20 - 10);
  const change = price - previousClose;
  const changePercent = (change / previousClose) * 100;
  
  return {
    symbol: symbol,
    name: `${symbol.replace('.BSE', '').replace('.NSE', '')} Corporation`,
    price: parseFloat(price.toFixed(2)),
    previousClose: parseFloat(previousClose.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    lastUpdated: new Date().toISOString(),
    sector: 'Technology',
    industry: 'Software',
    description: `This is mock data for ${symbol}. In a production environment, you would see real company information here.`
  };
};

// Helper function to generate mock news data
const generateMockNewsData = () => {
  return [
    {
      id: 1,
      headline: "Market Update: SENSEX rises 300 points",
      content: "Indian stock market shows recovery as SENSEX rises 300 points led by banking and IT stocks.",
      source: "Market News",
      publishedAt: new Date().toISOString(),
      category: "markets",
      url: null
    },
    {
      id: 2,
      headline: "RBI maintains repo rate at 6.5%",
      content: "The Reserve Bank of India has decided to maintain the repo rate at 6.5% in its latest monetary policy meeting.",
      source: "Economic Times",
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      category: "policy",
      url: null
    },
    {
      id: 3,
      headline: "IT sector shows strong quarterly results",
      content: "Major IT companies reported better than expected results for the last quarter, showing resilience despite global headwinds.",
      source: "Business Standard",
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      category: "companies",
      url: null
    },
    {
      id: 4,
      headline: "Adani Group announces major renewable energy project",
      content: "Adani Green Energy has announced a ₹12,500 crore investment in a new solar power project in Rajasthan.",
      source: "Financial Express",
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      category: "companies",
      url: null
    },
    {
      id: 5,
      headline: "Auto sales surge in Q2 2025",
      content: "Passenger vehicle sales have increased by 15% year-over-year in the second quarter of 2025, signaling strong consumer demand.",
      source: "Auto News India",
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
      category: "industry",
      url: null
    }
  ];
};

// Add these new functions with mock fallbacks

export const fetchTrendingStocks = async () => {
  if (ENABLE_MOCK_DATA) {
    return generateMockTrendingStocks();
  }
  
  try {
    const response = await stockApi.get('/trending', {
      headers: { 'x-api-key': API_KEY }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending stocks:', error);
    return generateMockTrendingStocks();
  }
};

const generateMockTrendingStocks = () => {
  return [
    { symbol: 'RELIANCE', name: 'Reliance Industries', trend: 'up', volume: '2.5M', price: 2750.50 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', trend: 'down', volume: '1.2M', price: 3625.75 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', trend: 'up', volume: '3.1M', price: 1690.25 },
    { symbol: 'INFY', name: 'Infosys', trend: 'down', volume: '1.8M', price: 1520.80 },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', trend: 'up', volume: '2.2M', price: 925.40 }
  ];
};

export const fetchIPOData = async () => {
  if (ENABLE_MOCK_DATA) {
    return generateMockIPOData();
  }
  
  try {
    const response = await stockApi.get('/ipo', {
      headers: { 'x-api-key': API_KEY }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching IPO data:', error);
    return generateMockIPOData();
  }
};

const generateMockIPOData = () => {
  return [
    { 
      name: 'GreenTech Solutions', 
      symbol: 'GREENTECH', 
      price: '₹450-520', 
      date: '2025-05-20', 
      status: 'Upcoming',
      subscription: 'N/A',
      size: '₹1,200 Cr'
    },
    { 
      name: 'Bharat Electronics', 
      symbol: 'BHAREL', 
      price: '₹320-350', 
      date: '2025-05-15', 
      status: 'Open',
      subscription: '2.4x',
      size: '₹850 Cr'
    },
    { 
      name: 'Digital Payments Ltd', 
      symbol: 'DIGIPAY', 
      price: '₹250-280', 
      date: '2025-05-05', 
      status: 'Closed',
      subscription: '5.2x',
      size: '₹1,500 Cr'
    }
  ];
};