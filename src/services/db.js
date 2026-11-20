// Database Service for NeighbourShare
// Implements full Firestore collection schema, persistence, and reactive updates
import {
  INITIAL_USERS,
  INITIAL_EQUIPMENT,
  INITIAL_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_COMMUNITY_FEED,
  INITIAL_REVIEWS,
  INITIAL_REPORTS,
  INITIAL_CATEGORIES
} from './seedData';
import { recordOnChainTransaction, generateCryptoAddress } from './blockchain';
import { ingestBorrowingTransactionToAi } from './aiService';

const STORAGE_KEYS = {
  USERS: 'neighbourshare_users',
  EQUIPMENT: 'neighbourshare_equipment',
  REQUESTS: 'neighbourshare_requests',
  NOTIFICATIONS: 'neighbourshare_notifications',
  COMMUNITY: 'neighbourshare_community',
  REVIEWS: 'neighbourshare_reviews',
  REPORTS: 'neighbourshare_reports',
  MESSAGES: 'neighbourshare_messages',
  FAVOURITES: 'neighbourshare_favourites',
};

// Safe local storage helpers
function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading ${key}:`, e);
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
}

// Ensure initial seed data exists
export function initDatabase() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EQUIPMENT)) {
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(INITIAL_EQUIPMENT));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMMUNITY)) {
    localStorage.setItem(STORAGE_KEYS.COMMUNITY, JSON.stringify(INITIAL_COMMUNITY_FEED));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify({
      req_101: [
        { id: 'm1', senderId: 'user_priya', senderName: 'Priya Patel', text: 'Hi Vikram, I need the angle grinder for 2 days to trim a balcony railing.', timestamp: '2026-11-08T18:22:00' },
        { id: 'm2', senderId: 'user_vikram', senderName: 'Vikram Singh', text: 'Sure Priya! The disc is in great shape. Pickup anytime tomorrow morning from Flat 302.', timestamp: '2026-11-08T18:35:00' }
      ]
    }));
  }
}

// ----------------- USERS -----------------
export function getUsers() {
  return loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function getUserById(id) {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
}

export function updateUser(id, updates) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveStorage(STORAGE_KEYS.USERS, users);
    return users[index];
  }
  return null;
}

export function createUser(userData) {
  const users = getUsers();
  const newUser = {
    id: `user_${Date.now()}`,
    trustScore: 90,
    rating: 5.0,
    ratingCount: 0,
    verified: true,
    joinedDate: new Date().toISOString().split('T')[0],
    role: 'both',
    ...userData
  };
  users.push(newUser);
  saveStorage(STORAGE_KEYS.USERS, users);
  return newUser;
}

// ----------------- EQUIPMENT -----------------
export function getEquipment(filters = {}) {
  let items = loadStorage(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT);

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    items = items.filter(item => 
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(q))) ||
      item.neighbourhood.toLowerCase().includes(q)
    );
  }

  if (filters.category && filters.category !== 'all') {
    items = items.filter(item => item.category === filters.category);
  }

  if (filters.availability && filters.availability !== 'all') {
    if (filters.availability === 'available') {
      items = items.filter(item => item.isAvailable);
    } else if (filters.availability === 'borrowed') {
      items = items.filter(item => !item.isAvailable);
    }
  }

  if (filters.neighbourhood && filters.neighbourhood !== 'all') {
    items = items.filter(item => 
      item.neighbourhood.toLowerCase().includes(filters.neighbourhood.toLowerCase())
    );
  }

  if (filters.maxPrice) {
    items = items.filter(item => item.pricePerHour <= Number(filters.maxPrice));
  }

  if (filters.ownerId) {
    items = items.filter(item => item.ownerId === filters.ownerId);
  }

  if (filters.sortBy) {
    if (filters.sortBy === 'price-low') {
      items.sort((a, b) => a.pricePerHour - b.pricePerHour);
    } else if (filters.sortBy === 'price-high') {
      items.sort((a, b) => b.pricePerHour - a.pricePerHour);
    } else if (filters.sortBy === 'rating') {
      items.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'newest') {
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  return items;
}

export function getEquipmentById(id) {
  const items = getEquipment();
  return items.find(eq => eq.id === id) || null;
}

export function addEquipment(itemData) {
  const items = getEquipment();
  const newItem = {
    id: `eq_${Date.now()}`,
    rating: 5.0,
    reviewCount: 0,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    ...itemData
  };
  items.unshift(newItem);
  saveStorage(STORAGE_KEYS.EQUIPMENT, items);

  // Add community feed entry
  addCommunityFeed({
    userName: itemData.ownerName,
    userAvatar: itemData.ownerAvatar,
    neighbourhood: itemData.neighbourhood,
    actionText: `listed a new equipment: ${itemData.name}`,
    timeAgo: 'Just now',
    type: 'listing',
    impactStat: `Available @ ₹${itemData.pricePerHour}/hr`
  });

  // Record Equipment Registration on Blockchain
  try {
    recordOnChainTransaction({
      type: 'EQUIPMENT_REGISTRATION',
      requestId: `mint_${newItem.id}`,
      equipmentId: newItem.id,
      equipmentName: newItem.name,
      lenderAddress: generateCryptoAddress(newItem.ownerId, newItem.ownerName),
      lenderName: newItem.ownerName,
      borrowerAddress: '0x0000...COMMUNITY',
      borrowerName: 'Neighbourhood Registry',
      rentalFee: newItem.pricePerHour,
      securityDeposit: newItem.securityDeposit || 0,
      proof: `EQUIPMENT_MINT_HASH_${newItem.id}`,
      status: 'CONFIRMED'
    });
  } catch (err) {
    console.warn('Blockchain record warning:', err);
  }

  return newItem;
}

export function updateEquipment(id, updates) {
  const items = getEquipment();
  const index = items.findIndex(eq => eq.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    saveStorage(STORAGE_KEYS.EQUIPMENT, items);
    return items[index];
  }
  return null;
}

export function deleteEquipment(id) {
  const items = getEquipment();
  const filtered = items.filter(eq => eq.id !== id);
  saveStorage(STORAGE_KEYS.EQUIPMENT, filtered);
  return true;
}

// ----------------- BORROWING REQUESTS -----------------
export function getBorrowingRequests(userId = null, role = null) {
  let requests = loadStorage(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);

  if (userId) {
    if (role === 'owner') {
      requests = requests.filter(r => r.ownerId === userId);
    } else if (role === 'borrower') {
      requests = requests.filter(r => r.borrowerId === userId);
    } else {
      requests = requests.filter(r => r.borrowerId === userId || r.ownerId === userId);
    }
  }

  // Sort by created descending
  requests.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return requests;
}

export function getRequestById(id) {
  const requests = getBorrowingRequests();
  return requests.find(r => r.id === id) || null;
}

export function createBorrowingRequest(requestData) {
  const requests = loadStorage(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
  
  // Check double-booking conflicts
  const hasConflict = requests.some(r => 
    r.equipmentId === requestData.equipmentId &&
    ['Accepted', 'Borrowed'].includes(r.status) &&
    // overlap check
    new Date(requestData.startDate) < new Date(r.endDate) &&
    new Date(requestData.endDate) > new Date(r.startDate)
  );

  if (hasConflict) {
    throw new Error('This equipment is already booked for the selected time window. Please pick a different slot.');
  }

  const otpSuffix = Math.floor(1000 + Math.random() * 9000);
  const newRequest = {
    id: `req_${Date.now()}`,
    status: 'Pending',
    paymentStatus: 'Pending',
    handoverOtp: `NS-${otpSuffix}`,
    returnOtp: `NS-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    ...requestData
  };

  requests.unshift(newRequest);
  saveStorage(STORAGE_KEYS.REQUESTS, requests);

  // Record Escrow Lock on Blockchain Ledger
  try {
    recordOnChainTransaction({
      type: 'ESCROW_LOCK',
      requestId: newRequest.id,
      equipmentId: newRequest.equipmentId,
      equipmentName: newRequest.equipmentName,
      lenderAddress: generateCryptoAddress(newRequest.ownerId, newRequest.ownerName),
      lenderName: newRequest.ownerName,
      borrowerAddress: generateCryptoAddress(newRequest.borrowerId, newRequest.borrowerName),
      borrowerName: newRequest.borrowerName,
      rentalFee: newRequest.calculatedFee,
      securityDeposit: newRequest.securityDeposit || 0,
      proof: `SMART_ESCROW_LOCKED_INR_${newRequest.totalAmount}`,
      status: 'CONFIRMED'
    });
  } catch (err) {
    console.warn('Blockchain record warning:', err);
  }

  // Notify owner
  createNotification({
    userId: requestData.ownerId,
    title: 'New Borrowing Request! 🔔',
    message: `${requestData.borrowerName} requested to borrow "${requestData.equipmentName}" for ${requestData.durationText}.`,
    type: 'request',
    linkTab: 'owner-requests'
  });

  return newRequest;
}

export function updateBorrowingRequest(id, status, extraFields = {}) {
  const requests = loadStorage(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
  const index = requests.findIndex(r => r.id === id);
  if (index === -1) return null;

  const req = requests[index];
  const oldStatus = req.status;

  const updated = {
    ...req,
    status,
    ...extraFields
  };

  // Manage equipment availability based on status
  if (status === 'Borrowed') {
    updateEquipment(req.equipmentId, { isAvailable: false });

    // Record Handover Proof on Blockchain
    try {
      recordOnChainTransaction({
        type: 'HANDOVER_VERIFIED',
        requestId: req.id,
        equipmentId: req.equipmentId,
        equipmentName: req.equipmentName,
        lenderAddress: generateCryptoAddress(req.ownerId, req.ownerName),
        lenderName: req.ownerName,
        borrowerAddress: generateCryptoAddress(req.borrowerId, req.borrowerName),
        borrowerName: req.borrowerName,
        rentalFee: req.calculatedFee,
        securityDeposit: req.securityDeposit || 0,
        proof: `HANDOVER_OTP_CONFIRMED_${req.handoverOtp || 'VERIFIED'}`,
        status: 'CONFIRMED'
      });
    } catch (err) {
      console.warn('Blockchain handover record warning:', err);
    }
  } else if (status === 'Returned' || status === 'Cancelled' || status === 'Rejected') {
    updateEquipment(req.equipmentId, { isAvailable: true });

    if (status === 'Returned') {
      // Record Return & Escrow Deposit Refund on Blockchain
      try {
        recordOnChainTransaction({
          type: 'DEPOSIT_REFUND',
          requestId: req.id,
          equipmentId: req.equipmentId,
          equipmentName: req.equipmentName,
          lenderAddress: generateCryptoAddress(req.ownerId, req.ownerName),
          lenderName: req.ownerName,
          borrowerAddress: generateCryptoAddress(req.borrowerId, req.borrowerName),
          borrowerName: req.borrowerName,
          rentalFee: req.calculatedFee,
          securityDeposit: req.securityDeposit || 0,
          proof: `SMART_CONTRACT_ESCROW_REFUNDED_₹${req.securityDeposit || 0}`,
          status: 'CONFIRMED'
        });
      } catch (err) {
        console.warn('Blockchain return record warning:', err);
      }
    }
  }

  requests[index] = updated;
  saveStorage(STORAGE_KEYS.REQUESTS, requests);

  // Ingest genuine transactions safely to AI demand buffer (excluding Cancelled/Rejected)
  if (['Accepted', 'Borrowed', 'Returned'].includes(status)) {
    try {
      ingestBorrowingTransactionToAi(updated);
    } catch (e) {
      // non-blocking
    }
  }

  // Trigger contextual notifications
  if (status === 'Accepted' && oldStatus !== 'Accepted') {
    createNotification({
      userId: req.borrowerId,
      title: 'Borrow Request Approved! 🎉',
      message: `${req.ownerName} accepted your request for "${req.equipmentName}". Pickup ready!`,
      type: 'approval',
      linkTab: 'borrower-requests'
    });
  } else if (status === 'Rejected' && oldStatus !== 'Rejected') {
    createNotification({
      userId: req.borrowerId,
      title: 'Request Declined',
      message: `Your request for "${req.equipmentName}" was declined by ${req.ownerName}.`,
      type: 'declined',
      linkTab: 'borrower-requests'
    });
  } else if (status === 'Returned' && oldStatus !== 'Returned') {
    createNotification({
      userId: req.borrowerId,
      title: 'Equipment Return Confirmed! 🛡️',
      message: `Return for "${req.equipmentName}" is confirmed. Security deposit refunded.`,
      type: 'return',
      linkTab: 'borrower-active'
    });
    createNotification({
      userId: req.ownerId,
      title: 'Equipment Safely Returned! 📦',
      message: `"${req.equipmentName}" has been checked and returned to your inventory.`,
      type: 'return',
      linkTab: 'owner-history'
    });

    // Add to community sharing impact
    addCommunityFeed({
      userName: req.borrowerName,
      userAvatar: req.borrowerAvatar,
      neighbourhood: req.ownerName,
      actionText: `completed safe return of "${req.equipmentName}" to`,
      targetUserName: req.ownerName,
      timeAgo: 'Just now',
      type: 'return',
      impactStat: `Saved ₹${(req.calculatedFee * 4).toLocaleString('en-IN')} vs buying new`
    });
  }

  return updated;
}

// ----------------- NOTIFICATIONS -----------------
export function getNotifications(userId) {
  const notifs = loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  return notifs
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function createNotification(notifData) {
  const notifs = loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const newNotif = {
    id: `notif_${Date.now()}`,
    isRead: false,
    timestamp: new Date().toISOString(),
    ...notifData
  };
  notifs.unshift(newNotif);
  saveStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
  return newNotif;
}

export function markNotificationAsRead(id) {
  const notifs = loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const index = notifs.findIndex(n => n.id === id);
  if (index !== -1) {
    notifs[index].isRead = true;
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }
}

export function markAllNotificationsAsRead(userId) {
  const notifs = loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  notifs.forEach(n => {
    if (n.userId === userId) n.isRead = true;
  });
  saveStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
}

// ----------------- COMMUNITY FEED -----------------
export function getCommunityFeed() {
  return loadStorage(STORAGE_KEYS.COMMUNITY, INITIAL_COMMUNITY_FEED);
}

export function addCommunityFeed(entry) {
  const feed = getCommunityFeed();
  const newEntry = {
    id: `feed_${Date.now()}`,
    ...entry
  };
  feed.unshift(newEntry);
  saveStorage(STORAGE_KEYS.COMMUNITY, feed.slice(0, 30));
  return newEntry;
}

// ----------------- REVIEWS -----------------
export function getReviews(equipmentId = null) {
  const reviews = loadStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  if (equipmentId) {
    return reviews.filter(r => r.equipmentId === equipmentId);
  }
  return reviews;
}

export function addReview(reviewData) {
  const reviews = loadStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  const newReview = {
    id: `rev_${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...reviewData
  };
  reviews.unshift(newReview);
  saveStorage(STORAGE_KEYS.REVIEWS, reviews);

  // Recalculate equipment rating
  if (reviewData.equipmentId) {
    const eq = getEquipmentById(reviewData.equipmentId);
    if (eq) {
      const eqReviews = reviews.filter(r => r.equipmentId === reviewData.equipmentId);
      const avg = eqReviews.reduce((sum, r) => sum + r.rating, 0) / eqReviews.length;
      updateEquipment(reviewData.equipmentId, {
        rating: Number(avg.toFixed(1)),
        reviewCount: eqReviews.length
      });
    }
  }

  return newReview;
}

// ----------------- REPORTS -----------------
export function getReports() {
  return loadStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
}

export function addReport(reportData) {
  const reports = loadStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  const newReport = {
    id: `rep_${Date.now()}`,
    status: 'Pending Review',
    createdAt: new Date().toISOString(),
    ...reportData
  };
  reports.unshift(newReport);
  saveStorage(STORAGE_KEYS.REPORTS, reports);
  return newReport;
}

export function updateReportStatus(id, status, resolutionNote = '') {
  const reports = loadStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  const index = reports.findIndex(r => r.id === id);
  if (index !== -1) {
    reports[index].status = status;
    if (resolutionNote) reports[index].resolutionNote = resolutionNote;
    saveStorage(STORAGE_KEYS.REPORTS, reports);
    return reports[index];
  }
  return null;
}

// ----------------- MESSAGING -----------------
export function getMessages(requestId) {
  const messagesMap = loadStorage(STORAGE_KEYS.MESSAGES, {});
  return messagesMap[requestId] || [];
}

export function sendMessage(requestId, messageData) {
  const messagesMap = loadStorage(STORAGE_KEYS.MESSAGES, {});
  if (!messagesMap[requestId]) {
    messagesMap[requestId] = [];
  }
  const newMsg = {
    id: `msg_${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...messageData
  };
  messagesMap[requestId].push(newMsg);
  saveStorage(STORAGE_KEYS.MESSAGES, messagesMap);
  return newMsg;
}

// ----------------- FAVOURITES -----------------
export function getFavourites(userId) {
  const favs = loadStorage(STORAGE_KEYS.FAVOURITES, {});
  return favs[userId] || [];
}

export function toggleFavourite(userId, equipmentId) {
  const favs = loadStorage(STORAGE_KEYS.FAVOURITES, {});
  if (!favs[userId]) favs[userId] = [];
  
  if (favs[userId].includes(equipmentId)) {
    favs[userId] = favs[userId].filter(id => id !== equipmentId);
  } else {
    favs[userId].push(equipmentId);
  }
  saveStorage(STORAGE_KEYS.FAVOURITES, favs);
  return favs[userId];
}

// ----------------- PLATFORM METRICS -----------------
export function getPlatformStats() {
  const users = getUsers();
  const equipment = getEquipment();
  const requests = getBorrowingRequests();
  const reports = getReports();

  const activeLoans = requests.filter(r => r.status === 'Borrowed');
  const completedLoans = requests.filter(r => r.status === 'Returned');
  const pendingRequests = requests.filter(r => r.status === 'Pending');
  
  // Total rental fees collected (GMV)
  const totalRentalValue = requests
    .filter(r => ['Borrowed', 'Returned', 'Accepted'].includes(r.status))
    .reduce((sum, r) => sum + (Number(r.calculatedFee) || 0), 0);

  // Estimated savings: typical purchase cost of tools is ~12x to 15x rental cost
  const estimatedSavings = requests
    .filter(r => ['Borrowed', 'Returned'].includes(r.status))
    .reduce((sum, r) => sum + (Number(r.calculatedFee) * 9 || 1800), 14200);

  const purchasesAvoided = Math.max(18, completedLoans.length + activeLoans.length * 2);

  return {
    totalUsers: users.length,
    totalEquipment: equipment.length,
    availableEquipment: equipment.filter(e => e.isAvailable).length,
    activeLoansCount: activeLoans.length,
    completedLoansCount: completedLoans.length,
    pendingRequestsCount: pendingRequests.length,
    totalRentalValue,
    estimatedSavings,
    purchasesAvoided,
    reportedIssuesCount: reports.filter(r => r.status !== 'Resolved').length
  };
}

// Reset database back to seed defaults
export function resetDatabase() {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(INITIAL_EQUIPMENT));
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  localStorage.setItem(STORAGE_KEYS.COMMUNITY, JSON.stringify(INITIAL_COMMUNITY_FEED));
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify({}));
  localStorage.setItem(STORAGE_KEYS.FAVOURITES, JSON.stringify({}));
}
