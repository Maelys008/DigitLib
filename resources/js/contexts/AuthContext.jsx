import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const result = await api.login(email, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const register = async (email, password, passwordConfirmation) => {
    const result = await api.register(email, password, passwordConfirmation);
    return result;
  };

  const verifyOtp = async (email, otp) => {
    const result = await api.verifyOtp(email, otp);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const completeProfile = async (name, tel, identityHash) => {
    const result = await api.completeProfile(name, tel, identityHash);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const updateUser = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    verifyOtp,
    completeProfile,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}