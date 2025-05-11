import axios from 'axios';
import { API_URL } from '../config';

// API_URL is now correctly configured in config.js to use localhost:8080/api when in development mode

export const login = async (email, password) => {
  try {
    console.log('Attempting login to:', `${API_URL}/auth/login`);
    const response = await axios.post(
      `${API_URL}/auth/login`, 
      { email, password },
      { 
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
    console.log('Attempting registration to:', `${API_URL}/auth/register`);
    return await axios.post(
      `${API_URL}/auth/register`, 
      {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone
      },
      {
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
  localStorage.removeItem('userData');
};