import React, { useEffect, useState } from "react";
import { fetchNews } from "./services/api";
import './MarketNews.css';

const MarketNews = () => {
  const [news, setNews] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);
  const [error, setError] = useState(null);
  
  // Cache key for localStorage
  const getCacheKey = (category) => `news_cache_${category}`;
  const getCacheTimeKey = (category) => `news_cache_time_${category}`;

  // Load news from API or cache
  const getNews = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we have cached data and it's not a forced refresh
      if (!forceRefresh) {
        const cachedNews = localStorage.getItem(getCacheKey(category));
        const cachedTime = localStorage.getItem(getCacheTimeKey(category));
        
        if (cachedNews && cachedTime) {
          const parsedNews = JSON.parse(cachedNews);
          const fetchTime = new Date(cachedTime);
          const now = new Date();
          
          // Only use cache if it's less than 15 minutes old (reduced time to get fresher news)
          if ((now - fetchTime) < 15 * 60 * 1000) {
            setNews(parsedNews);
            setLastFetched(fetchTime);
            setLoading(false);
            return;
          }
        }
      }
      
      // If no cached data or forced refresh, fetch from API
      const newsData = await fetchNews(category);
      setNews(newsData);
      
      // Cache the results
      localStorage.setItem(getCacheKey(category), JSON.stringify(newsData));
      const now = new Date();
      localStorage.setItem(getCacheTimeKey(category), now.toISOString());
      setLastFetched(now);
      
      console.log("News data fetched from API:", newsData);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setError("Failed to fetch the latest news. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // On component mount or category change, load news (preferring cache)
  useEffect(() => {
    getNews(false);
  }, [category]);

  // Format publication date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    // Check if dateString is a relative time format like "1 hour ago"
    if (typeof dateString === 'string' && dateString.includes('ago')) {
      return dateString;
    }
    
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-IN', options);
    } catch (e) {
      return dateString; // Return original string if date parsing fails
    }
  };

  // Format last fetched time
  const formatLastFetched = () => {
    if (!lastFetched) return "Never";
    
    const now = new Date();
    const diff = now - new Date(lastFetched);
    
    // Less than a minute
    if (diff < 60000) {
      return "Just now";
    }
    // Less than an hour
    else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    // Less than a day
    else if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    // Just show the date
    else {
      return lastFetched.toLocaleDateString('en-IN');
    }
  };
  
  // Get item property with fallback for different API formats
  const getItemProperty = (item, primaryKey, backupKey, defaultValue = '') => {
    if (item[primaryKey] !== undefined) return item[primaryKey];
    if (item[backupKey] !== undefined) return item[backupKey];
    return defaultValue;
  };
  
  // Convert category string to proper display format
  const formatCategory = (category) => {
    if (!category) return 'GENERAL';
    
    // If it's already uppercase, return as is
    if (category === category.toUpperCase()) return category;
    
    // Otherwise capitalize first letter
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  return (
    <div className="market-news-container">
      <h2>Indian Market News & Insights</h2>
      
      <div className="news-header">
        <div className="news-filters">
          <button 
            className={`filter-btn ${category === 'all' ? 'active' : ''}`}
            onClick={() => setCategory('all')}
          >
            All News
          </button>
          <button 
            className={`filter-btn ${category === 'market' ? 'active' : ''}`}
            onClick={() => setCategory('market')}
          >
            Markets
          </button>
          <button 
            className={`filter-btn ${category === 'stocks' ? 'active' : ''}`}
            onClick={() => setCategory('stocks')}
          >
            Stocks
          </button>
          <button 
            className={`filter-btn ${category === 'banking' ? 'active' : ''}`}
            onClick={() => setCategory('banking')}
          >
            Banking
          </button>
          <button 
            className={`filter-btn ${category === 'tech' ? 'active' : ''}`}
            onClick={() => setCategory('tech')}
          >
            Tech
          </button>
          <button 
            className={`filter-btn ${category === 'corporate' ? 'active' : ''}`}
            onClick={() => setCategory('corporate')}
          >
            Corporate
          </button>
        </div>
        
        <div className="refresh-section">
          <span className="last-updated">Last updated: {formatLastFetched()}</span>
          <button 
            className="refresh-btn" 
            onClick={() => getNews(true)}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh News'}
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-news">Loading latest market news...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="news-grid">
          {news.length > 0 ? news.map((item, index) => (
            <div key={item.id || `news-${index}`} className="news-card">
              <div className="news-content">
                <span className="news-source">
                  {getItemProperty(item, 'source', 'publisher', 'Financial News')}
                </span>
                <span className="news-date">
                  {getItemProperty(item, 'timestamp', 'publishedAt') ? 
                    formatDate(getItemProperty(item, 'timestamp', 'publishedAt')) : ''}
                </span>
                <h3 className="news-headline">
                  {getItemProperty(item, 'title', 'headline')}
                </h3>
                <p className="news-details">
                  {getItemProperty(item, 'content', 'summary')}
                </p>
                <div className="news-categories">
                  {item.categories && Array.isArray(item.categories) ? (
                    item.categories.map((cat, i) => (
                      <span key={i} className="news-category">{formatCategory(cat)}</span>
                    ))
                  ) : (
                    <span className="news-category">
                      {formatCategory(getItemProperty(item, 'category', 'categories', 'GENERAL'))}
                    </span>
                  )}
                </div>
                {item.url && (
                  <a 
                    href={item.url} 
                    className="read-more" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Read More
                  </a>
                )}
              </div>
            </div>
          )) : (
            <div className="no-news-message">No news articles available for this category. Please try another category or refresh.</div>
          )}
        </div>
      )}
      
      <div className="news-disclaimer">
        <p>Disclaimer: Market news provided for informational purposes only. Investment decisions should be based on thorough research.</p>
        <p>Data Source: Finance News API - finance-news-api.kundanprojects.space</p>
      </div>
    </div>
  );
};

export default MarketNews;