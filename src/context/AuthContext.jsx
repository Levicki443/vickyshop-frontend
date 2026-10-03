import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginUser,
  registerUser,
  fetchUserProfile,
  updateUserProfile,
  updateUserPassword,
} from '../services/api';
import { fetchSellerNotifications, upgradeToSellerAccount } from '../services/sellerApi';
import { fetchClientNotifications } from '../services/notificationApi';
import { joinUserRoom, joinSellerRoom } from '../services/socket';
import { isSellerRole, isClientRole, isAdminRole, normalizeRole } from '../utils/roleUtils';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('vicky_auth_token'));
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('vicky_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSellerDashboardOpen, setIsSellerDashboardOpen] = useState(() => {
    return window.location.pathname.toLowerCase().startsWith('/vendeur');
  });

  const [sellerUnreadCount, setSellerUnreadCount] = useState(0);
  const [clientUnreadCount, setClientUnreadCount] = useState(0);

  const persistSession = useCallback((authToken, authUser) => {
    if (authToken) {
      localStorage.setItem('vicky_auth_token', authToken);
      setToken(authToken);
    }
    if (authUser) {
      localStorage.setItem('vicky_auth_user', JSON.stringify(authUser));
      setUser(authUser);
    }
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('vicky_auth_token');
    localStorage.removeItem('vicky_auth_user');
    setToken(null);
    setUser(null);
    setSellerUnreadCount(0);
    setClientUnreadCount(0);
  }, []);

  const checkAuth = useCallback(async () => {
    const savedToken = localStorage.getItem('vicky_auth_token');
    if (!savedToken) {
      clearSession();
      setLoading(false);
      return;
    }

    try {
      const profile = await fetchUserProfile(savedToken);
      persistSession(savedToken, profile);
    } catch (error) {
      console.warn('[AuthContext] Session expirée :', error.message);
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession, persistSession]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Connexion automatique aux rooms WebSocket Socket.IO
  useEffect(() => {
    if (user) {
      const uId = user._id || user.id;
      joinUserRoom(uId);
      if (isSellerRole(user.role)) {
        joinSellerRoom(uId);
      }
    }
  }, [user]);

  // Actualisation des compteurs de notifications client et vendeur
  const refreshClientUnreadCount = useCallback(async () => {
    const activeToken = token || localStorage.getItem('vicky_auth_token');
    if (!activeToken || !user) {
      setClientUnreadCount(0);
      return;
    }
    try {
      const res = await fetchClientNotifications(activeToken);
      setClientUnreadCount(res.unreadCount || 0);
    } catch {}
  }, [token, user]);

  const refreshSellerUnreadCount = useCallback(async () => {
    const activeToken = token || localStorage.getItem('vicky_auth_token');
    if (!activeToken || !isSellerRole(user?.role)) {
      setSellerUnreadCount(0);
      return;
    }
    try {
      const notifData = await fetchSellerNotifications(activeToken);
      setSellerUnreadCount(notifData.unreadCount || 0);
    } catch {}
  }, [token, user?.role]);

  useEffect(() => {
    if (user && token) {
      refreshClientUnreadCount();
      if (isSellerRole(user.role)) {
        refreshSellerUnreadCount();
      }
    }
  }, [user, token, refreshClientUnreadCount, refreshSellerUnreadCount]);

  const login = async (email, password) => {
    const response = await loginUser({ email, password });
    const { token: receivedToken, data } = response;
    persistSession(receivedToken, data.user);
    setIsAuthModalOpen(false);
    return data.user;
  };

  const register = async (userData) => {
    const response = await registerUser(userData);
    const { token: receivedToken, data } = response;
    persistSession(receivedToken, data.user);
    setIsAuthModalOpen(false);
    return data.user;
  };

  const updateProfile = async (userData) => {
    if (!token) throw new Error('Vous devez être connecté.');
    const updatedUser = await updateUserProfile(userData, token);
    persistSession(token, updatedUser);
    return updatedUser;
  };

  const upgradeToSeller = async (shopData) => {
    if (!token) throw new Error('Vous devez être connecté.');
    const updatedUser = await upgradeToSellerAccount(shopData, token);
    persistSession(token, updatedUser);
    return updatedUser;
  };

  const updatePassword = async (currentPassword, newPassword) => {
    if (!token) throw new Error('Vous devez être connecté.');
    const response = await updateUserPassword({ currentPassword, newPassword }, token);
    if (response.token) {
      localStorage.setItem('vicky_auth_token', response.token);
      setToken(response.token);
    }
    if (response.data && response.data.user) {
      persistSession(response.token || token, response.data.user);
    }
    return response;
  };

  const logout = () => {
    clearSession();
    setIsProfileModalOpen(false);
    setIsSellerDashboardOpen(false);
    if (window.location.pathname.toLowerCase().startsWith('/vendeur')) {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const isSeller = isSellerRole(user?.role);
  const isCustomer = isClientRole(user?.role);
  const isAdmin = isAdminRole(user?.role);
  const userRole = user?.role ? normalizeRole(user.role) : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isSeller,
        isCustomer,
        isAdmin,
        userRole,
        loading,
        login,
        register,
        updateProfile,
        upgradeToSeller,
        updatePassword,
        logout,
        sellerUnreadCount,
        setSellerUnreadCount,
        refreshSellerUnreadCount,
        clientUnreadCount,
        setClientUnreadCount,
        refreshClientUnreadCount,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isProfileModalOpen,
        openProfileModal: () => setIsProfileModalOpen(true),
        closeProfileModal: () => setIsProfileModalOpen(false),
        isSellerDashboardOpen,
        openSellerDashboard: () => setIsSellerDashboardOpen(true),
        closeSellerDashboard: () => setIsSellerDashboardOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé au sein d'un AuthProvider");
  }
  return context;
};
