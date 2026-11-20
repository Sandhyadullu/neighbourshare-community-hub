import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getUsers } from '../../services/db';
import {
  Share2,
  Search,
  Bell,
  Heart,
  User,
  ShieldCheck,
  PlusCircle,
  Menu,
  X,
  LogOut,
  MapPin,
  ChevronDown,
  Layers,
  Sparkles,
  Database,
  ArrowRight,
  Link2,
  BrainCircuit
} from 'lucide-react';

export default function Navbar() {
  const {
    currentUser,
    currentRole,
    setCurrentRole,
    activeTab,
    setActiveTab,
    openAuth,
    logout,
    switchUser,
    userNotifications,
    unreadNotifCount,
    favourites,
    setModalState
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoSwitchOpen, setDemoSwitchOpen] = useState(false);

  const allUsers = getUsers();

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'browse', label: 'Browse Equipment' },
    { id: 'ai-prediction', label: 'AI Demand Prediction', isAi: true },
    { id: 'blockchain', label: 'Blockchain Ledger', isCrypto: true },
    { id: 'community', label: 'Neighbourhood' },
    { id: 'impact', label: 'Sharing Impact' },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setNotifDropdownOpen(false);
    setUserDropdownOpen(false);
    setDemoSwitchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Neighbourhood Awareness Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 text-white text-xs font-medium py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span>Active Community:</span>
            <span className="font-semibold underline underline-offset-2 flex items-center gap-1">
              <MapPin size={12} /> {currentUser?.neighbourhood || 'Bengaluru Local'} (PIN: {currentUser?.pincode || '560038'})
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[11px] text-emerald-100">
            <span>Tagline: "Share More, Spend Less, Live Better"</span>
            <span>•</span>
            <button 
              onClick={() => setModalState(s => ({ ...s, firebaseConfig: true }))}
              className="flex items-center gap-1 hover:text-white transition-colors underline cursor-pointer"
            >
              <Database size={11} /> Cloud / Storage Config
            </button>
            <span>•</span>
            <div className="relative">
              <button
                onClick={() => setDemoSwitchOpen(!demoSwitchOpen)}
                className="flex items-center gap-1 font-semibold text-white bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full transition-all cursor-pointer"
              >
                <span>Switch Demo User</span>
                <ChevronDown size={11} />
              </button>

              {demoSwitchOpen && (
                <div className="absolute right-0 mt-1 w-60 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-400 border-b border-slate-100 mb-1">
                    Select Test Profile
                  </div>
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setDemoSwitchOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-emerald-50 transition-colors ${
                        currentUser?.id === u.id ? 'bg-emerald-50 font-bold text-emerald-700' : 'text-slate-700'
                      }`}
                    >
                      <img src={u.avatar} alt={u.fullName} className="w-6 h-6 rounded-full object-cover" />
                      <div className="flex-1 truncate">
                        <div className="truncate">{u.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-normal truncate">{u.neighbourhood}</div>
                      </div>
                      {u.role === 'admin' && (
                        <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Admin</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTabChange('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Share2 size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-900 to-emerald-700 bg-clip-text text-transparent">
                  Neighbour<span className="text-brand-600">Share</span>
                </span>
                <span className="block text-[10px] font-medium text-slate-500 tracking-wide uppercase">
                  Community Equipment Hub
                </span>
              </div>
            </button>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleTabChange(link.id)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === link.id
                    ? 'text-brand-700 bg-brand-50 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {link.isAi && <BrainCircuit size={14} className="text-indigo-600" />}
                {link.isCrypto && <Link2 size={13} className="text-emerald-600" />}
                <span>{link.label}</span>
                {link.isAi && (
                  <span className="text-[9px] font-black bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full font-mono">
                    ML
                  </span>
                )}
                {link.isCrypto && (
                  <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-mono">
                    Ledger
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Role Switcher Pill (Borrower vs Owner vs Admin) */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setCurrentRole('borrower');
                handleTabChange('borrower-dashboard');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentRole === 'borrower' && activeTab === 'borrower-dashboard'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Borrower Mode</span>
            </button>
            <button
              onClick={() => {
                setCurrentRole('owner');
                handleTabChange('owner-dashboard');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentRole === 'owner' && activeTab === 'owner-dashboard'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Owner Mode</span>
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  setCurrentRole('admin');
                  handleTabChange('admin');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                <ShieldCheck size={13} />
                <span>Admin</span>
              </button>
            )}
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2">
            {/* Quick Add Listing CTA (for Owners) */}
            <button
              onClick={() => {
                if (!currentUser) {
                  openAuth('login');
                  return;
                }
                setCurrentRole('owner');
                setModalState(s => ({ ...s, addEquipment: true }));
              }}
              className="hidden sm:flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all hover:shadow-brand-500/30 cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>List Tool</span>
            </button>

            {/* Favourites Shortcut */}
            <button
              onClick={() => {
                handleTabChange('borrower-dashboard');
              }}
              title="Saved Equipment"
              className="relative p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              <Heart size={19} className={favourites.length > 0 ? 'fill-rose-500 text-rose-500' : ''} />
              {favourites.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {favourites.length}
                </span>
              )}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell size={19} />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-brand-600" />
                      <span className="font-bold text-sm text-slate-900">Notifications</span>
                    </div>
                    <span className="text-xs bg-brand-100 text-brand-800 font-semibold px-2 py-0.5 rounded-full">
                      {unreadNotifCount} new
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 py-1">
                    {userNotifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No notifications yet. You're all caught up!
                      </div>
                    ) : (
                      userNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            setNotifDropdownOpen(false);
                            if (notif.linkTab?.startsWith('owner')) {
                              setCurrentRole('owner');
                              handleTabChange('owner-dashboard');
                            } else {
                              setCurrentRole('borrower');
                              handleTabChange('borrower-dashboard');
                            }
                          }}
                          className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer rounded-xl ${
                            !notif.isRead ? 'bg-emerald-50/60' : ''
                          }`}
                        >
                          <div className="text-xs font-semibold text-slate-900 flex items-center justify-between">
                            <span>{notif.title}</span>
                            <span className="text-[10px] text-slate-400">Just now</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar / Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/40"
                  />
                  <div className="hidden sm:block text-left text-xs">
                    <span className="font-bold text-slate-900 block truncate max-w-[90px]">
                      {currentUser.fullName.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-brand-600 font-semibold">
                      ★ {currentUser.rating || 5.0}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in-50 zoom-in-95">
                    <div className="px-3 py-2.5 bg-slate-50 rounded-xl mb-1 border border-slate-100">
                      <div className="font-bold text-sm text-slate-900">{currentUser.fullName}</div>
                      <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                      <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                        <MapPin size={11} /> {currentUser.neighbourhood}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setCurrentRole('borrower');
                        handleTabChange('borrower-dashboard');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-between"
                    >
                      <span>Borrower Dashboard</span>
                      <ArrowRight size={13} className="text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setCurrentRole('owner');
                        handleTabChange('owner-dashboard');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-between"
                    >
                      <span>Owner Dashboard</span>
                      <ArrowRight size={13} className="text-slate-400" />
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setCurrentRole('admin');
                          handleTabChange('admin');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-between"
                      >
                        <span>Admin Console</span>
                        <ShieldCheck size={14} className="text-purple-600" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setModalState(s => ({ ...s, profileEdit: true }));
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Edit Profile & Address
                    </button>

                    <div className="my-1 border-t border-slate-100"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth('login')}
                  className="text-xs font-semibold text-slate-700 hover:text-brand-600 px-3 py-2 rounded-xl transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-all"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 space-y-2 animate-in fade-in-50">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleTabChange(link.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  activeTab === link.id
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="pt-2 border-t border-slate-200">
              <div className="flex gap-2 p-2">
                <button
                  onClick={() => {
                    setCurrentRole('borrower');
                    handleTabChange('borrower-dashboard');
                  }}
                  className={`flex-1 py-2 text-center rounded-xl text-xs font-semibold ${
                    currentRole === 'borrower' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Borrower View
                </button>
                <button
                  onClick={() => {
                    setCurrentRole('owner');
                    handleTabChange('owner-dashboard');
                  }}
                  className={`flex-1 py-2 text-center rounded-xl text-xs font-semibold ${
                    currentRole === 'owner' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Owner View
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
