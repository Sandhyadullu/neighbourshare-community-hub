import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initDatabase,
  getUsers,
  getUserById,
  updateUser,
  createUser,
  getEquipment,
  getBorrowingRequests,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getFavourites,
  toggleFavourite as dbToggleFavourite,
  getPlatformStats,
  resetDatabase as dbReset
} from '../services/db';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Ensure DB seeded
  useEffect(() => {
    initDatabase();
  }, []);

  // Current active user (default Ramesh Kumar for instant rich owner/borrower preview)
  const [currentUser, setCurrentUser] = useState(() => {
    initDatabase();
    return getUserById('user_ramesh') || getUsers()[0];
  });

  // Current viewing mode: 'owner' | 'borrower' | 'admin'
  const [currentRole, setCurrentRole] = useState('borrower');

  // Active navigation view
  // 'home' | 'browse' | 'owner-dashboard' | 'borrower-dashboard' | 'community' | 'impact' | 'admin'
  const [activeTab, setActiveTab] = useState('home');

  // Search & Filter state
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    category: 'all',
    availability: 'all',
    neighbourhood: 'all',
    maxPrice: '',
    sortBy: 'newest'
  });

  // Selected equipment for detail view
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  // Selected request for Handover QR / Payment / Return
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Active modals
  const [modalState, setModalState] = useState({
    auth: false,
    authMode: 'login', // 'login' | 'register' | 'forgot'
    equipmentDetail: false,
    addEquipment: false,
    editEquipment: null,
    borrowRequest: false,
    qrCode: false,
    qrType: 'handover', // 'handover' | 'return'
    payment: false,
    messenger: false,
    activeChatRequest: null,
    reportIssue: false,
    reportTarget: null,
    conditionTracker: false,
    conditionTrackerRequest: null,
    profileEdit: false,
    firebaseConfig: false
  });

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Data refresh ticker to reactively refresh lists across tabs
  const [refreshTick, setRefreshTick] = useState(0);

  const refreshData = () => {
    setRefreshTick(t => t + 1);
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Switch demo user easily
  const switchUser = (userId) => {
    const user = getUserById(userId);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'admin') {
        setCurrentRole('admin');
        setActiveTab('admin');
      } else if (currentRole === 'admin') {
        setCurrentRole('borrower');
        setActiveTab('home');
      }
      showToast(`Switched user to ${user.fullName} (${user.neighbourhood})`, 'info');
    }
  };

  const openAuth = (mode = 'login') => {
    setModalState(s => ({ ...s, auth: true, authMode: mode }));
  };

  const closeAuth = () => {
    setModalState(s => ({ ...s, auth: false }));
  };

  const logout = () => {
    // Switch to Ananya or guest
    const users = getUsers();
    setCurrentUser(users[0]);
    setCurrentRole('borrower');
    showToast('Logged out successfully. Re-assigned to demo guest session.', 'info');
  };

  // Notifications reactive list
  const userNotifications = currentUser ? getNotifications(currentUser.id) : [];
  const unreadNotifCount = userNotifications.filter(n => !n.isRead).length;

  // Favourites
  const favourites = currentUser ? getFavourites(currentUser.id) : [];

  const handleToggleFavourite = (equipmentId) => {
    if (!currentUser) {
      openAuth('login');
      return;
    }
    const updated = dbToggleFavourite(currentUser.id, equipmentId);
    refreshData();
    const isFav = updated.includes(equipmentId);
    showToast(isFav ? 'Added to Saved Equipment ❤️' : 'Removed from Saved Equipment', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentRole,
        setCurrentRole,
        activeTab,
        setActiveTab,
        searchFilters,
        setSearchFilters,
        selectedEquipment,
        setSelectedEquipment,
        selectedRequest,
        setSelectedRequest,
        modalState,
        setModalState,
        toasts,
        showToast,
        refreshTick,
        refreshData,
        switchUser,
        openAuth,
        closeAuth,
        logout,
        userNotifications,
        unreadNotifCount,
        favourites,
        handleToggleFavourite
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
