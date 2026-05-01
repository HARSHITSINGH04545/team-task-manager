// client/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set token in axios headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Fetch user data
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/auth/me');
      setUser(data.user);
    } catch (err) {
      console.error('Error fetching user:', err);
      setToken(null);
    }
  };

  const signup = async (name, email, password, confirmPassword) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.post('/auth/signup', {
        name,
        email,
        password,
        confirmPassword
      });
      setToken(data.token);
      setUser(data.user);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Error during signup';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.post('/auth/login', { email, password });
      setToken(data.token);
      setUser(data.user);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Error during login';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        signup,
        login,
        logout,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};