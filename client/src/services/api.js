import axios from 'axios';
import { API_URL, API_BASE_URL, API_KEY, FINANCE_NEWS_API_URL, FINANCE_NEWS_API_KEY, ALPHA_VANTAGE_API_URL, ALPHA_VANTAGE_API_KEY } from '../config';

// Create API client for backend API
const api = axios.create({
  baseURL: API_URL
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Create separate instance for Indian Stock API
const stockApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-api-key': API_KEY
  }
});

// Create instance for Finance News API - using the documented header format
const financeNewsApi = axios.create({
  baseURL: FINANCE_NEWS_API_URL,
  headers: {
    'X-API-Key': FINANCE_NEWS_API_KEY
  }
});

// Create AlphaVantage API client
const alphaVantageApi = axios.create({
  baseURL: ALPHA_VANTAGE_API_URL
});

export default api;

// Stock market API functions
export const fetchNews = async (category = 'all') => {
  try {
    console.log('Fetching news from:', FINANCE_NEWS_API_URL);
    
    // Use the correct endpoint based on the actual API structure
    // Updated to use /news endpoint with category as query parameter if needed
    let endpoint = '/news';
    let params = {};
    if (category !== 'all') {
      params.category = category;
    }
    
    console.log(`Calling endpoint: ${FINANCE_NEWS_API_URL}${endpoint}`, params);
    
    // Make the API request with proper error handling
    const response = await axios({
      method: 'get',
      url: `${FINANCE_NEWS_API_URL}${endpoint}`,
      headers: {
        'X-API-Key': FINANCE_NEWS_API_KEY
      },
      params: params,
      timeout: 10000 // 10 second timeout
    });
    
    console.log('Finance news API response status:', response.status);
    
    // Check if we have valid data in the response
    if (response.data && Array.isArray(response.data)) {
      console.log('Got valid news array from finance API');
      
      // Transform the API response to match our expected format
      const transformedData = response.data.map(item => ({
        id: item.id || Math.random().toString(36).substring(2, 15),
        headline: item.title || '',
        title: item.title || '',
        content: item.content || item.description || '',
        summary: item.content || item.description || '',
        source: item.source || 'Finance News',
        publishedAt: item.publishedAt || item.date || new Date().toISOString(),
        pub_date: item.publishedAt || item.date || new Date().toISOString(),
        category: item.category || 'general',
        url: item.url || null
      }));
      
      return transformedData;
    } else if (response.data && response.data.articles && Array.isArray(response.data.articles)) {
      // Alternative response format with articles field
      console.log('Got valid news articles from finance API');
      
      const transformedData = response.data.articles.map(item => ({
        id: item.id || Math.random().toString(36).substring(2, 15),
        headline: item.title || '',
        title: item.title || '',
        content: item.content || item.description || '',
        summary: item.content || item.description || '',
        source: item.source || 'Finance News',
        publishedAt: item.publishedAt || item.date || new Date().toISOString(),
        pub_date: item.publishedAt || item.date || new Date().toISOString(),
        category: item.category || 'general',
        url: item.url || null
      }));
      
      return transformedData;
    }
    
    // If API response doesn't have the expected structure, fall back to server API
    console.log('Finance News API response has unexpected structure:', response.data);
    return fallbackToServerAPI(category);
  } catch (error) {
    console.error('Error fetching news from finance API:', error.message);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    return fallbackToServerAPI(category);
  }
};

// Helper function to handle fallbacks
const fallbackToServerAPI = async (category) => {
  try {
    console.log('Falling back to server API');
    const serverResponse = await api.get('/market-news');
    if (serverResponse && serverResponse.data) {
      console.log('Successfully fetched news from server API');
      return serverResponse.data;
    }
    throw new Error('No data from server API');
  } catch (serverError) {
    console.error('Server API fallback failed:', serverError.message);
    
    try {
      console.log('Trying stock API fallback');
      const fallbackResponse = await stockApi.get('/news', {
        params: category !== 'all' ? { category } : {},
        headers: {
          'x-api-key': API_KEY // Explicitly include the API key in request headers
        }
      });
      if (fallbackResponse && fallbackResponse.data) {
        console.log('Successfully fetched news from stock API');
        return fallbackResponse.data;
      }
      throw new Error('No data from stock API');
    } catch (fallbackError) {
      console.error('All API fallbacks failed:', fallbackError.message);
      console.log('Using mock data as last resort');
      return generateMockNewsData();
    }
  }
};

// Helper function to generate mock news data as last resort
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
    }
  ];
};

// Enhanced stock details function with AlphaVantage integration
export const fetchStockDetails = async (stockSymbol) => {
  try {
    console.log(`Fetching stock data for: ${stockSymbol}`);
    
    // First try AlphaVantage Global Quote API
    const response = await alphaVantageApi.get('', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: stockSymbol,
        apikey: ALPHA_VANTAGE_API_KEY
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('AlphaVantage response:', response.data);
    
    // Check if we got valid data from AlphaVantage
    if (response.data && response.data['Global Quote'] && Object.keys(response.data['Global Quote']).length > 0) {
      const quote = response.data['Global Quote'];
      
      // Format the response to match our application's expected format
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
    
    // If AlphaVantage didn't return valid data, try fetching company overview for more details
    if (Object.keys(response.data).length === 0 || !response.data['Global Quote'] || Object.keys(response.data['Global Quote']).length === 0) {
      console.log('Fetching company overview for symbol:', stockSymbol);
      
      const overviewResponse = await alphaVantageApi.get('', {
        params: {
          function: 'OVERVIEW',
          symbol: stockSymbol,
          apikey: ALPHA_VANTAGE_API_KEY
        },
        timeout: 10000
      });
      
      console.log('AlphaVantage Overview response:', overviewResponse.data);
      
      if (overviewResponse.data && overviewResponse.data.Symbol) {
        // For overview data, we don't have current price, use the last price if available or a placeholder
        return {
          symbol: overviewResponse.data.Symbol,
          name: overviewResponse.data.Name || stockSymbol,
          price: parseFloat(overviewResponse.data['52WeekHigh']) || 0,
          previousClose: parseFloat(overviewResponse.data['52WeekHigh']) || 0,
          change: 0,
          changePercent: 0,
          lastUpdated: new Date().toISOString(),
          description: overviewResponse.data.Description,
          sector: overviewResponse.data.Sector,
          industry: overviewResponse.data.Industry
        };
      }
    }
    
    // Fall back to our original API if AlphaVantage fails
    console.log('Falling back to local stock API');
    return fallbackToStockApi(stockSymbol);
    
  } catch (error) {
    console.error('Error fetching stock details from AlphaVantage:', error);
    
    // Fall back to our original implementation if AlphaVantage fails
    return fallbackToStockApi(stockSymbol);
  }
};

// Fallback to the original Stock API implementation
const fallbackToStockApi = async (stockSymbol) => {
  try {
    console.log('Using stock API fallback for', stockSymbol);
    const response = await stockApi.get(`/stock`, {
      params: { name: stockSymbol },
      headers: {
        'x-api-key': API_KEY // Explicitly include the API key in request headers
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in stock API fallback:', error);
    throw error;
  }
};

export const fetchTrendingStocks = async () => {
  try {
    const response = await stockApi.get('/trending', {
      headers: {
        'x-api-key': API_KEY // Explicitly include the API key in request headers
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending stocks:', error);
    throw error;
  }
};

export const fetchIPOData = async () => {
  try {
    const response = await stockApi.get('/ipo', {
      headers: {
        'x-api-key': API_KEY // Explicitly include the API key in request headers
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching IPO data:', error);
    throw error;
  }
};