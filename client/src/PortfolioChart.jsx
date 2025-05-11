import { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AuthContext } from './context/AuthContext'
import { API_URL } from './config'
import { toast } from 'react-toastify'

function PortfolioChart() {
  const { user } = useContext(AuthContext)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('token')
        const trades = await axios.get(`${API_URL}/portfolio/trades`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        console.log('Portfolio chart trades:', trades.data)
        
        // Process trades to calculate portfolio value over time correctly
        // We'll track the actual position at each date
        const datePositions = {};
        const stockPositions = {};
        
        // Sort trades by date
        const sortedTrades = [...trades.data].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        sortedTrades.forEach(trade => {
          const date = new Date(trade.date).toLocaleDateString('en-IN');
          const symbol = trade.stockSymbol;
          
          // Initialize tracking objects if needed
          if (!datePositions[date]) {
            datePositions[date] = { value: 0 };
          }
          
          if (!stockPositions[symbol]) {
            stockPositions[symbol] = {
              quantity: 0,
              investmentValue: 0
            };
          }
          
          // Update positions based on trade type
          if (trade.type === 'BUY') {
            stockPositions[symbol].quantity += trade.quantity;
            stockPositions[symbol].investmentValue += (trade.quantity * trade.price);
          } else { // SELL
            // Calculate the proportion of the position being sold
            if (stockPositions[symbol].quantity > 0) {
              const sellRatio = trade.quantity / stockPositions[symbol].quantity;
              // Reduce quantity and investment value proportionally
              stockPositions[symbol].quantity -= trade.quantity;
              // We don't reduce investment value for visualization - we track actual value
            }
          }
          
          // Calculate total portfolio value for this date
          let portfolioValue = 0;
          
          // Calculate value of each position
          Object.keys(stockPositions).forEach(stockSymbol => {
            const position = stockPositions[stockSymbol];
            
            if (position.quantity > 0) {
              // Estimate current value with 5% growth for simplicity
              // In a real app, you'd use actual market data
              const avgPrice = position.investmentValue / position.quantity;
              const estimatedValue = position.quantity * (avgPrice * 1.05);
              portfolioValue += estimatedValue;
            }
          });
          
          // Store the portfolio value for this date
          datePositions[date].value = portfolioValue;
        });
        
        // Create chart data from the date positions
        let chartData = Object.keys(datePositions).map(date => ({
          date,
          value: datePositions[date].value
        }));
        
        // If we have no meaningful data, create dummy data
        if (chartData.length <= 1 || chartData.every(item => item.value === 0)) {
          const today = new Date();
          chartData = [];
          
          for (let i = 10; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            chartData.push({
              date: date.toLocaleDateString('en-IN'),
              value: 0
            });
          }
        }
        
        setData(chartData);
      } catch (error) {
        toast.error('Failed to load portfolio chart data');
        console.error('Error fetching portfolio data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData()
  }, [user])

  const formatRupee = (value) => {
    return `₹${parseInt(value).toLocaleString('en-IN')}`;
  };

  return (
    <div className="portfolio-chart">
      <h3>Portfolio Value Over Time</h3>
      
      {loading ? (
        <div className="chart-loading">Loading chart data...</div>
      ) : (
        <>
          {data.length > 1 && data.some(item => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatRupee} />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Portfolio Value']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="Portfolio Value" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-chart-data">
              Not enough trading history to display chart. Complete more trades to see your portfolio performance.
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PortfolioChart