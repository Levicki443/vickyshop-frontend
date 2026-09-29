import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginUser,
  registerUser,
  fetchUserProfile,
  updateUserProfile,
  updateUserPassword,
} from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('vicky_auth_token'));
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Chargement du profil utilisateur si un token est présent
  const checkAuth = useCallback(async () => {
    const savedToken = localStorage.getItem('vicky_auth_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const profile = await fetchUserProfile(savedToken);
      setUser(profile);
      setToken(savedToken);
    } catch (error) {
      console.warn('[AuthContext] Session invalide ou expirée :', error.message);
      localStorage.removeItem('vicky_auth_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Connexion
  const login = async (email, password) => {
    const response = await loginUser({ email, password });
    const { token: receivedToken, data } = response;

    localStorage.setItem('vicky_auth_token', receivedToken);
    setToken(receivedToken);
    setUser(data.user);
    setIsAuthModalOpen(false);
    return data.user;
  };

  // Inscription
  const register = async (userData) => {
    const response = await registerUser(userData);
    const { token: receivedToken, data } = response;

    localStorage.setItem('vicky_auth_token', receivedToken);
    setToken(receivedToken);
    setUser(data.user);
    setIsAuthModalOpen(false);
    return data.user;
  };

  // Mise à jour des informations du profil
  const updateProfile = async (userData) => {
    if (!token) throw new Error('Vous devez être connecté.');
    const updatedUser = await updateUserProfile(userData, token);
    setUser(updatedUser);
    return updatedUser;
  };

  // Mise à jour du mot de passe
  const updatePassword = async (currentPassword, newPassword) => {
    if (!token) throw new Error('Vous devez être connecté.');
    const response = await updateUserPassword({ currentPassword, newPassword }, token);
    if (response.token) {
      localStorage.setItem('vicky_auth_token', response.token);
      setToken(response.token);
    }
    if (response.data && response.data.user) {
      setUser(response.data.user);
    }
    return response;
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem('vicky_auth_token');
    setUser(null);
    setToken(null);
    setIsProfileModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        updateProfile,
        updatePassword,
        logout,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isProfileModalOpen,
        openProfileModal: () => setIsProfileModalOpen(true),
        closeProfileModal: () => setIsProfileModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé au sein d\'un AuthProvider');
  }
  return context;
};
