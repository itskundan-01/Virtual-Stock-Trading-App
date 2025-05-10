/**
 * Application Configuration
 * 
 * This file centralizes all URL configurations and API settings.
 * Values are loaded from environment variables to ensure proper
 * separation of configuration from code.
 */

// API Base URLs
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://stock.indianapi.in";
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
// Updated the finance news API URL to the correct domain
export const FINANCE_NEWS_API_URL = import.meta.env.VITE_FINANCE_NEWS_API_URL || 'https://finance-news.kundanprojects.space';
// AlphaVantage API configuration
export const ALPHA_VANTAGE_API_URL = "https://www.alphavantage.co/query";
export const ALPHA_VANTAGE_API_KEY = "LG1LRCEPYYLALG5Q";

// API Keys and Auth
export const API_KEY = import.meta.env.VITE_API_KEY || "";
export const FINANCE_NEWS_API_KEY = import.meta.env.VITE_FINANCE_NEWS_API_KEY || "MiaaEdv6406K9wmvjYT3fOpL4M4tSzuc";

// Feature Flags
export const ENABLE_MOCK_DATA = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true' || false;

// App-specific URLs
export const URLS = {
  // External resources
  NSE_DERIVATIVES: "https://www.nseindia.com/learn/content/derivatives-futures-options",
  BSE_INVESTOR_EDUCATION: "https://www.bseindia.com/investors/investor_education.html",
  
  // Internal routes 
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PORTFOLIO: "/portfolio",
  STOCK_PRICE: "/stock-price",
  TRADE: "/trade",
  TUTORIALS: "/tutorials",
  MARKET_NEWS: "/market-news",
  COMPETITIONS: "/competitions",
  FORUM: "/forum",
  WALLET: "/wallet",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  ADMIN: "/admin"
};

export default {
  API_URL,
  API_BASE_URL,
  API_KEY,
  FINANCE_NEWS_API_URL,
  FINANCE_NEWS_API_KEY,
  ALPHA_VANTAGE_API_URL,
  ALPHA_VANTAGE_API_KEY,
  URLS
};