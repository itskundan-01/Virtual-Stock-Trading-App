import axios from 'axios';
import { API_URL } from '../config';

// Helper to determine if we're in development mode
const isDevelopment = window.location.hostname === 'localhost';
const getBaseUrl = () => isDevelopment ? 'http://localhost:8080/api' : API_URL;

export const login = async (email, password) => {
  try {
    // Use direct axios for login to avoid token issues
    const response = await axios.post(
      `${getBaseUrl()}/auth/login`, 
      { email, password },
      { 
        withCredentials: false,  // Set to false to avoid CORS preflight issues
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    // Store token in localStorage if it exists
    if (response.data && response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      console.log('Token saved successfully');
    }
    
    return response;
  } catch (error) {
    console.error('Login error details:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    return await axios.post(
      `${getBaseUrl()}/auth/register`, 
      {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone
      },
      {
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Registration error details:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};