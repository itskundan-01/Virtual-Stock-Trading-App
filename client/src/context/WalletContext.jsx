import { createContext, useState, useContext, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import { AuthContext } from './AuthContext'
import api from '../services/api';

export const WalletContext = createContext()

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [transactionPagination, setTransactionPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  })
  const [loading, setLoading] = useState(true)
  const { user } = useContext(AuthContext)
  
  // Add refs to track pending requests
  const isFetchingWallet = useRef(false)
  const isFetchingTransactions = useRef(false)
  const initialFetchDone = useRef(false)

  // Fetch wallet when user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (user && token && !initialFetchDone.current) {
      setTimeout(() => {
        fetchWallet();
        initialFetchDone.current = true;
      }, 500); // Small delay to ensure token is properly set in interceptor
    } else if (!user) {
      setWallet(null);
      setTransactions([]);
      setLoading(false);
      initialFetchDone.current = false;
    }
  }, [user]);

  const fetchWallet = async () => {
    if (isFetchingWallet.current) return;
    try {
      isFetchingWallet.current = true;
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }
      
      const response = await api.get('/wallet/balance', {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Wallet response:", response.data);
      setWallet({ balance: response.data.balance });
    } catch (error) {
      console.error('Error fetching wallet:', error);
      if (error.response && error.response.status === 401) {
        // Handle token expiration
        console.log('Token may have expired, redirecting to login');
      }
    } finally {
      setLoading(false);
      isFetchingWallet.current = false;
    }
  };

  const fetchTransactions = async (page = 1, limit = 10) => {
    if (isFetchingTransactions.current) return [];
    
    try {
      isFetchingTransactions.current = true;
      const response = await api.get(`/wallet/transactions?page=${page}&limit=${limit}`);
      const data = response.data;
      setTransactions(data.transactions || []);
      setTransactionPagination({
        page: data.page || 1,
        limit: data.limit || 10,
        total: data.total || 0,
        pages: data.pages || 1
      });
      return data.transactions || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transaction history');
      return [];
    } finally {
      isFetchingTransactions.current = false;
    }
  };

  const addFunds = async (amount) => {
    try {
      const response = await api.post('/wallet/deposit', { 
        amount: parseFloat(amount) 
      });
      setWallet(response.data.wallet);
      toast.success(`Successfully added ₹${amount} to your wallet`);
      await fetchTransactions();
      return response.data;
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error(error.response?.data?.error || 'Failed to add funds');
      throw error;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount)
  }

  return (
    <WalletContext.Provider value={{ 
      wallet, 
      transactions, 
      transactionPagination,
      loading,
      fetchWallet,
      fetchTransactions,
      addFunds,
      formatCurrency
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
