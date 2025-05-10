import { Link } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import './Home.css';
import heroImage from './assets/hpagepic.jpg';
import competitionImage from './assets/competiton.jpeg';

function Home() {
  const { user } = useContext(AuthContext);
  const [animateStats, setAnimateStats] = useState(false);
  
  useEffect(() => {
    // Start stat counter animation when component mounts
    setAnimateStats(true);
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-on-scroll').forEach(item => {
      observer.observe(item);
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to MahaLakshya</h1>
          <h2>India's Premier Stock Market Simulator</h2>
          <p>Master the markets with our risk-free trading platform. Practice investing in Indian equities with virtual money and gain real experience.</p>
          
          <div className="cta-buttons">
            {user ? (
              <Link to="/dashboard" className="cta-button primary">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/register" className="cta-button primary">Start Trading</Link>
                <Link to="/login" className="cta-button secondary">Login</Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-image">
          <img src={heroImage} alt="Trading Illustration" />
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-container">
          <div className="stat-number">
            <span className={animateStats ? 'counter' : ''} data-target="50000">
              {animateStats ? '50,000+' : '0'}
            </span>
          </div>
          <div className="stat-label">Active Traders</div>
        </div>
        
        <div className="stat-container">
          <div className="stat-number">
            <span className={animateStats ? 'counter' : ''} data-target="1000">
              {animateStats ? '1,000+' : '0'}
            </span>
          </div>
          <div className="stat-label">Stocks Available</div>
        </div>
        
        <div className="stat-container">
          <div className="stat-number">
            <span className={animateStats ? 'counter' : ''} data-target="10">
              {animateStats ? '10 Cr+' : '0'}
            </span>
          </div>
          <div className="stat-label">Virtual Money Traded</div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose MahaLakshya?</h2>
        
        <div className="features-grid">
          <div className="feature-card animate-on-scroll">
            <div className="feature-icon">📊</div>
            <h3>Risk-Free Trading</h3>
            <p>Practice with ₹5,00,000 in virtual money. Experiment with strategies without risking real capital.</p>
          </div>
          
          <div className="feature-card animate-on-scroll">
            <div className="feature-icon">🏆</div>
            <h3>Trading Competitions</h3>
            <p>Participate in weekly and monthly trading contests with exciting rewards and leaderboards.</p>
          </div>
          
          <div className="feature-card animate-on-scroll">
            <div className="feature-icon">📱</div>
            <h3>Real-Time Market Data</h3>
            <p>Access NSE and BSE stock quotes, charts, and market indices updated in real-time.</p>
          </div>
          
          <div className="feature-card animate-on-scroll">
            <div className="feature-icon">🎓</div>
            <h3>Educational Resources</h3>
            <p>Learn with our comprehensive tutorials, market insights, and expert analysis.</p>
          </div>
          
          <div className="feature-card animate-on-scroll">
            <div className="feature-icon">💬</div>
            <h3>Community Forum</h3>
            <p>Connect with fellow traders, share insights, and discuss market trends.</p>
          </div>
          
          <div className="feature-card animate-on-scroll">
            <div className="feature-icon">🔒</div>
            <h3>Secure Platform</h3>
            <p>Advanced encryption and two-factor authentication to keep your account secure.</p>
          </div>
        </div>
      </section>
      
      {/* Competition Section */}
      <section className="competition-section animate-on-scroll">
        <div className="competition-content">
          <h2>Trading Competitions</h2>
          <p>Put your trading skills to the test in our weekly and monthly trading competitions. Compete with traders nationwide, climb the leaderboard, and win exciting prizes.</p>
          <ul className="competition-features">
            <li>Start with equal virtual capital</li>
            <li>Trade any NSE/BSE listed securities</li>
            <li>Real-time leaderboard updates</li>
            <li>Cash prizes for top performers</li>
          </ul>
          {!user && <Link to="/register" className="cta-button secondary">Join Competition</Link>}
        </div>
        <div className="competition-image">
          <img src={competitionImage} alt="Trading Competition" />
        </div>
      </section>
      
      {/* Learning Section */}
      <section className="learning-section">
        <h2 className="section-title">Learn as You Trade</h2>
        <div className="learning-grid">
          <div className="learning-card animate-on-scroll">
            <h3>Market Basics</h3>
            <p>Understand Indian stock market fundamentals, indices, and trading mechanics.</p>
            {user ? (
              <Link to="/tutorials" className="learn-link">Start Learning →</Link>
            ) : (
              <Link to="/register" className="learn-link">Register to Access →</Link>
            )}
          </div>
          
          <div className="learning-card animate-on-scroll">
            <h3>Technical Analysis</h3>
            <p>Master charts, indicators, and patterns to identify trading opportunities.</p>
            {user ? (
              <Link to="/tutorials" className="learn-link">Start Learning →</Link>
            ) : (
              <Link to="/register" className="learn-link">Register to Access →</Link>
            )}
          </div>
          
          <div className="learning-card animate-on-scroll">
            <h3>Fundamental Analysis</h3>
            <p>Evaluate companies based on financial statements and business models.</p>
            {user ? (
              <Link to="/tutorials" className="learn-link">Start Learning →</Link>
            ) : (
              <Link to="/register" className="learn-link">Register to Access →</Link>
            )}
          </div>
          
          <div className="learning-card animate-on-scroll">
            <h3>Market News</h3>
            <p>Stay updated with the latest market news, policy changes, and corporate actions.</p>
            {user ? (
              <Link to="/market-news" className="learn-link">Read News →</Link>
            ) : (
              <Link to="/register" className="learn-link">Register to Access →</Link>
            )}
          </div>
        </div>
      </section>
      
      {/* Testimonial Section */}
      <section className="testimonials-section animate-on-scroll">
        <h2 className="section-title">What Our Users Say</h2>
        <div className="testimonials-container">
          <div className="testimonial-card">
            <div className="quote">"MahaLakshya helped me understand market dynamics before I invested my real money. The platform is intuitive and the learning resources are excellent."</div>
            <div className="testimonial-author">- Priya Sharma, Mumbai</div>
          </div>
          
          <div className="testimonial-card">
            <div className="quote">"The trading competitions are both fun and educational. I've significantly improved my strategies by participating regularly."</div>
            <div className="testimonial-author">- Rahul Verma, Bangalore</div>
          </div>
          
          <div className="testimonial-card">
            <div className="quote">"As a beginner, I was intimidated by stock markets. MahaLakshya's risk-free environment gave me the confidence to learn and eventually trade with real money."</div>
            <div className="testimonial-author">- Ananya Desai, Pune</div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="final-cta-section">
        <h2>Ready to Start Your Trading Journey?</h2>
        <p>Join thousands of traders and investors who have improved their skills with MahaLakshya.</p>
        {user ? (
          <Link to="/dashboard" className="cta-button primary large">Go to Dashboard</Link>
        ) : (
          <div className="cta-buttons">
            <Link to="/register" className="cta-button primary large">Create Free Account</Link>
            <Link to="/login" className="cta-button secondary large">Login</Link>
          </div>
        )}
      </section>
      
      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-column">
            <h3>MahaLakshya</h3>
            <p>India's premier stock market simulator for learning and practicing trading strategies without financial risk.</p>
          </div>
          
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/login">Login</Link></li>
              {user && <li><Link to="/dashboard">Dashboard</Link></li>}
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Resources</h3>
            <ul>
              <li><Link to="/tutorials">Tutorials</Link></li>
              <li><Link to="/market-news">Market News</Link></li>
              <li><Link to="/competitions">Competitions</Link></li>
              <li><Link to="/forum">Community Forum</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Legal</h3>
            <ul>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/disclaimer">Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="copyright">
          <p>© 2023 MahaLakshya. All rights reserved. Disclaimer: Trading in financial markets involves risk. Virtual trading does not guarantee future results.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;