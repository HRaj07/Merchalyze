import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081' });

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mz_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      API.get('/api/v1/auth/me')
        .then(r => setUser(r.data.data))
        .catch(() => { localStorage.removeItem('mz_token'); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const r = await API.post('/api/v1/auth/login', { email, password });
    const { accessToken, user } = r.data.data;
    localStorage.setItem('mz_token', accessToken);
    API.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setToken(accessToken); setUser(user);
    return user;
  };

  const register = async (data) => {
    const r = await API.post('/api/v1/auth/register', data);
    const { accessToken, user } = r.data.data;
    localStorage.setItem('mz_token', accessToken);
    API.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setToken(accessToken); setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('mz_token');
    delete API.defaults.headers.common['Authorization'];
    setToken(null); setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, API }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { API };
