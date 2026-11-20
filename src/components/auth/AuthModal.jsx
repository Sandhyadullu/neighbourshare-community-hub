import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { createUser, getUsers } from '../../services/db';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
];

export default function AuthModal() {
  const { modalState, closeAuth, setCurrentUser, switchUser, showToast, refreshData } = useApp();
  const [mode, setMode] = useState(modalState.authMode || 'login'); // 'login' | 'register' | 'forgot'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [neighbourhood, setNeighbourhood] = useState('Indiranagar 4th Block');
  const [pincode, setPincode] = useState('560038');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

  if (!modalState.auth) return null;

  const allUsers = getUsers();

  const handleLogin = (e) => {
    e.preventDefault();
    const existing = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUser(existing);
      showToast(`Welcome back, ${existing.fullName}! 👋`, 'success');
      closeAuth();
    } else {
      // Allow instant seamless login with demo Ramesh if generic credentials provided
      const ramesh = allUsers[0];
      setCurrentUser(ramesh);
      showToast(`Logged in as ${ramesh.fullName} (${ramesh.neighbourhood})`, 'success');
      closeAuth();
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!fullName || !email || !mobile) {
      showToast('Please fill all required registration fields', 'error');
      return;
    }

    const newUser = createUser({
      fullName,
      email,
      mobile,
      neighbourhood,
      pincode,
      avatar: selectedAvatar,
      city: 'Bengaluru',
      role: 'both',
      bio: 'New member ready to share and borrow equipment in our neighbourhood!'
    });

    setCurrentUser(newUser);
    showToast(`Account created for ${newUser.fullName}! Welcome to NeighbourShare. 🎉`, 'success');
    refreshData();
    closeAuth();
  };

  const handleForgot = (e) => {
    e.preventDefault();
    showToast(`Password recovery link simulated for ${email}. Check your inbox!`, 'info');
    setMode('login');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in-50">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col my-auto">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {mode === 'login' ? 'Sign In to NeighbourShare' : mode === 'register' ? 'Join Your Neighbourhood' : 'Reset Your Password'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {mode === 'login' ? 'Access your borrowed tools & listings' : 'Start sharing & borrowing local equipment'}
            </p>
          </div>
          <button onClick={closeAuth} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* Quick Demo Switcher Strip */}
          <div className="mb-5 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs">
            <div className="font-bold text-emerald-900 mb-1.5 flex items-center gap-1">
              <Sparkles size={13} className="text-emerald-600" />
              <span>1-Click Test Sign-In Profiles:</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  switchUser('user_ramesh');
                  closeAuth();
                }}
                className="bg-white hover:bg-emerald-100/60 text-slate-800 p-1.5 rounded-xl border border-emerald-200 text-[11px] font-semibold text-left truncate cursor-pointer transition-colors"
              >
                🛠️ Ramesh (Owner)
              </button>
              <button
                type="button"
                onClick={() => {
                  switchUser('user_priya');
                  closeAuth();
                }}
                className="bg-white hover:bg-emerald-100/60 text-slate-800 p-1.5 rounded-xl border border-emerald-200 text-[11px] font-semibold text-left truncate cursor-pointer transition-colors"
              >
                🌿 Priya (Lender/Borrower)
              </button>
              <button
                type="button"
                onClick={() => {
                  switchUser('user_ananya');
                  closeAuth();
                }}
                className="bg-white hover:bg-emerald-100/60 text-slate-800 p-1.5 rounded-xl border border-emerald-200 text-[11px] font-semibold text-left truncate cursor-pointer transition-colors"
              >
                📦 Ananya (Borrower)
              </button>
              <button
                type="button"
                onClick={() => {
                  switchUser('user_admin');
                  closeAuth();
                }}
                className="bg-purple-100 hover:bg-purple-200 text-purple-900 p-1.5 rounded-xl border border-purple-300 text-[11px] font-bold text-left truncate cursor-pointer transition-colors"
              >
                🛡️ Admin Console
              </button>
            </div>
          </div>

          {/* LOGIN MODE */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@neighbourshare.in"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-brand-600 hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-500/20 transition-all cursor-pointer"
              >
                Sign In
              </button>

              <div className="text-center pt-2 text-slate-500 text-xs">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-brand-600 hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </div>
            </form>
          )}

          {/* REGISTER MODE */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Number (for Handover SMS/OTP) *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Neighbourhood / Colony *</label>
                  <input
                    type="text"
                    required
                    value={neighbourhood}
                    onChange={(e) => setNeighbourhood(e.target.value)}
                    placeholder="Indiranagar 4th Block"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Area PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="560038"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Choose Profile Avatar</label>
                <div className="flex items-center gap-2">
                  {AVATAR_OPTIONS.map((av, i) => (
                    <img
                      key={i}
                      src={av}
                      alt="avatar"
                      onClick={() => setSelectedAvatar(av)}
                      className={`w-10 h-10 rounded-full object-cover cursor-pointer transition-all ${
                        selectedAvatar === av ? 'ring-3 ring-brand-500 scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  Complete Registration
                </button>
              </div>

              <div className="text-center pt-1 text-slate-500 text-xs">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-brand-600 hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Enter your registered email address. We will send you a verification code to safely recover your account.
              </p>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@neighbourshare.in"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Send Password Reset Instructions
              </button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-slate-600 hover:text-slate-900"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
