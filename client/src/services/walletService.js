import api from './api';

export const getWalletBalance = async () => {
  return api.get('/api/wallet');
};

export const addFunds = async (amount) => {
  return api.post('/api/wallet/deposit', { amount });
};

export const withdrawFunds = async (amount) => {
  return api.post('/api/wallet/withdraw', { amount });
};