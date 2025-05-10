// filepath: /client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { login as authServiceLogin } from "../services/authService";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authServiceLogin(email, password);
      
      if (response.data && response.data.accessToken) {
        // Extract and format user data
        const userData = {
          id: response.data.id,
          email: response.data.email,
          name: `${response.data.firstName} ${response.data.lastName}`,
          isAdmin: response.data.roles.includes('ROLE_ADMIN'),
          twoFactorEnabled: response.data.twoFactorEnabled
        };
        
        // Store both token and user data for persistence
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem("userData", JSON.stringify(userData));
        
        setUser(userData);
        return response;
      }
    } catch (error) {
      console.error("Login error in AuthContext:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
export { AuthProvider };