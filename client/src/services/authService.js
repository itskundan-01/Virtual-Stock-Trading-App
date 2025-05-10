import axios from 'axios';
import { API_URL } from '../config';
import api from './api';

export const login = async (email, password) => {
  // Use direct axios for login to avoid token issues
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  
  // Store token in localStorage if it exists
  if (response.data.accessToken) {
    localStorage.setItem('token', response.data.accessToken);
  }
  
  return response;
};

export const register = async (userData) => {
  return axios.post(`${API_URL}/auth/register`, {
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    password: userData.password,
    phone: userData.phone
  });
};

export const logout = () => {
  localStorage.removeItem('token');
};