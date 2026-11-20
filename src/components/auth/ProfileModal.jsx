import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { updateUser } from '../../services/db';
import { X, User, MapPin, Phone, Mail, Check } from 'lucide-react';

export default function ProfileModal() {
  const { currentUser, setCurrentUser, modalState, setModalState, showToast, refreshData } = useApp();

  if (!modalState.profileEdit || !currentUser) return null;

  const [formData, setFormData] = useState({
    fullName: currentUser.fullName || '',
    mobile: currentUser.mobile || '',
    neighbourhood: currentUser.neighbourhood || '',
    pincode: currentUser.pincode || '',
    bio: currentUser.bio || ''
  });

  const handleClose = () => {
    setModalState(s => ({ ...s, profileEdit: false }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = updateUser(currentUser.id, formData);
    if (updated) {
      setCurrentUser(updated);
      showToast('Profile information updated successfully! ✨', 'success');
      refreshData();
    }
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-base font-bold text-slate-900">Edit Profile & Address</h3>
          <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
            <input
              type="tel"
              required
              value={formData.mobile}
              onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Neighbourhood</label>
              <input
                type="text"
                required
                value={formData.neighbourhood}
                onChange={(e) => setFormData(prev => ({ ...prev, neighbourhood: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">PIN Code</label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Community Bio</label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell neighbours about your DIY interests..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-xs"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
