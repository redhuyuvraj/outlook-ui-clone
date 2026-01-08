import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      const storedAccess = localStorage.getItem('access');
      const storedSession = localStorage.getItem('session');
      if (storedUser && storedSession) {
        const session = JSON.parse(storedSession);
        const now = new Date();
        const expiresAt = new Date(session.expires_at);
        if (now < expiresAt) {
          setUser(JSON.parse(storedUser));
          setAccess(storedAccess);
        } else {
          // Session expired, clear
          localStorage.removeItem('user');
          localStorage.removeItem('access');
          localStorage.removeItem('session');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const signIn = async (email, password) => {
    const response = await fetch('http://localhost:3001/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.success) {
      setUser(data.user);
      setAccess(data.access);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('access', data.access);
      localStorage.setItem('session', JSON.stringify(data.session));
    }
    return data;
  };

  const signOut = async () => {
    await fetch('http://localhost:3001/api/signout', { method: 'POST' });
    setUser(null);
    setAccess(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access');
    localStorage.removeItem('session');
  };

  return (
    <AuthContext.Provider value={{ user, access, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};