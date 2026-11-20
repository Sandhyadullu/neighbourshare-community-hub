import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { isFirebaseConfigured, firebaseConfig } from '../../services/firebase';
import { resetDatabase } from '../../services/db';
import { X, Database, CheckCircle, RefreshCw, Key, ShieldCheck, Layers } from 'lucide-react';

export default function FirebaseConfigModal() {
  const { modalState, setModalState, showToast, refreshData } = useApp();

  if (!modalState.firebaseConfig) return null;

  const handleClose = () => {
    setModalState(s => ({ ...s, firebaseConfig: false }));
  };

  const handleResetData = () => {
    if (window.confirm('Reset all NeighbourShare collections to fresh seed records?')) {
      resetDatabase();
      showToast('Database reset to fresh Bangalore neighbourhood seed data!', 'success');
      refreshData();
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Database size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Backend & Cloud Firestore Engine</h3>
              <p className="text-[10px] text-slate-500">Firebase Architecture & Storage Schema</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Status Badge */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <div className="font-bold text-emerald-950">
                  {isFirebaseConfigured ? 'Connected to Cloud Firestore' : 'Active Local-First Firestore Engine'}
                </div>
                <div className="text-[10px] text-emerald-700">
                  {isFirebaseConfigured
                    ? `Project: ${firebaseConfig.projectId}`
                    : 'Zero-friction persistence with reactive local-first Firestore collections'}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
              Live Ready
            </span>
          </div>

          {/* Collections Schema Overview */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Layers size={14} className="text-brand-600" />
              <span>Configured Firestore Collections:</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900">/users</span>
                <p className="text-slate-400 text-[10px]">Profiles, ratings, trust scores</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900">/equipment</span>
                <p className="text-slate-400 text-[10px]">Rates, availability, condition</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900">/borrowingRequests</span>
                <p className="text-slate-400 text-[10px]">OTPs, schedule, statuses</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900">/transactions</span>
                <p className="text-slate-400 text-[10px]">Rental fees & deposits in ₹</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900">/reviews</span>
                <p className="text-slate-400 text-[10px]">5-star ratings & feedback</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900">/reports</span>
                <p className="text-slate-400 text-[10px]">Safety & dispute tracking</p>
              </div>
            </div>
          </div>

          {/* Cloud Sync Instructions */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">To sync with a live Google Cloud project:</p>
            <p className="text-[11px]">
              Set <code className="bg-slate-200 px-1 rounded text-slate-800">VITE_FIREBASE_API_KEY</code> and{' '}
              <code className="bg-slate-200 px-1 rounded text-slate-800">VITE_FIREBASE_PROJECT_ID</code> in your{' '}
              <code className="bg-slate-200 px-1 rounded text-slate-800">.env</code> file.
            </p>
          </div>

          {/* Reset Demo Data Button */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetData}
              className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Reset Sample Data</span>
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
