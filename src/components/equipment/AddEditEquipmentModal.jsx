import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { addEquipment, updateEquipment } from '../../services/db';
import { INITIAL_CATEGORIES } from '../../services/seedData';
import { X, Upload, Plus, Check, Image as ImageIcon, Sparkles, Wrench } from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Impact Drill', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80' },
  { label: 'Pressure Washer', url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&auto=format&fit=crop&q=80' },
  { label: 'Toolkit & Spanners', url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=80' },
  { label: 'Lawn Trimmer', url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600&auto=format&fit=crop&q=80' },
  { label: 'Step Ladder', url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&auto=format&fit=crop&q=80' },
  { label: 'Extension Cord', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80' },
  { label: 'Paint Sprayer', url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80' },
];

export default function AddEditEquipmentModal() {
  const { modalState, setModalState, currentUser, showToast, refreshData } = useApp();
  const isEditing = Boolean(modalState.editEquipment);
  const editItem = modalState.editEquipment;

  const [formData, setFormData] = useState({
    name: '',
    category: 'electrical-tools',
    description: '',
    image: PRESET_IMAGES[0].url,
    pricePerHour: 30,
    pricePerDay: 200,
    securityDeposit: 500,
    condition: 'Like New',
    conditionDetails: '',
    neighbourhood: currentUser?.neighbourhood || 'Indiranagar 4th Block',
    pincode: currentUser?.pincode || '560038',
    isAvailable: true
  });

  useEffect(() => {
    if (isEditing && editItem) {
      setFormData({
        name: editItem.name || '',
        category: editItem.category || 'electrical-tools',
        description: editItem.description || '',
        image: editItem.image || PRESET_IMAGES[0].url,
        pricePerHour: editItem.pricePerHour || 30,
        pricePerDay: editItem.pricePerDay || 200,
        securityDeposit: editItem.securityDeposit || 500,
        condition: editItem.condition || 'Like New',
        conditionDetails: editItem.conditionDetails || '',
        neighbourhood: editItem.neighbourhood || currentUser?.neighbourhood,
        pincode: editItem.pincode || currentUser?.pincode,
        isAvailable: editItem.isAvailable !== undefined ? editItem.isAvailable : true
      });
    } else {
      setFormData({
        name: '',
        category: 'electrical-tools',
        description: '',
        image: PRESET_IMAGES[0].url,
        pricePerHour: 30,
        pricePerDay: 200,
        securityDeposit: 500,
        condition: 'Like New',
        conditionDetails: '',
        neighbourhood: currentUser?.neighbourhood || 'Indiranagar 4th Block',
        pincode: currentUser?.pincode || '560038',
        isAvailable: true
      });
    }
  }, [isEditing, editItem, currentUser]);

  if (!modalState.addEquipment && !modalState.editEquipment) return null;

  const handleClose = () => {
    setModalState(s => ({ ...s, addEquipment: false, editEquipment: null }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setFormData(prev => ({ ...prev, image: uploadEvent.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please provide an equipment name', 'error');
      return;
    }

    if (isEditing) {
      updateEquipment(editItem.id, {
        ...formData,
        pricePerHour: Number(formData.pricePerHour),
        pricePerDay: Number(formData.pricePerDay),
        securityDeposit: Number(formData.securityDeposit)
      });
      showToast('Equipment listing updated successfully! 🎉', 'success');
    } else {
      addEquipment({
        ...formData,
        pricePerHour: Number(formData.pricePerHour),
        pricePerDay: Number(formData.pricePerDay),
        securityDeposit: Number(formData.securityDeposit),
        ownerId: currentUser.id,
        ownerName: currentUser.fullName,
        ownerAvatar: currentUser.avatar,
        ownerRating: currentUser.rating || 5.0,
        ownerTrustScore: currentUser.trustScore || 95,
        approxDistance: '0.3 km away'
      });
      showToast('New tool listed in your neighbourhood! Neighbours can now find and request it.', 'success');
    }

    refreshData();
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in-50">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <Wrench size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Equipment Listing' : 'List Equipment in Your Neighbourhood'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Lenders earn hourly or daily fees while keeping security deposits safe
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1 space-y-4 text-xs">
          {/* Equipment Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Equipment Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Bosch GSB 550 Impact Drill Kit (13mm, 550W)"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                {INITIAL_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Equipment Condition *
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="Like New">Like New (barely used, spotless)</option>
                <option value="Excellent">Excellent (fully functional, minor signs of use)</option>
                <option value="Good">Good (reliable working condition)</option>
                <option value="Fair">Fair (older model, works as intended)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Description & What is Included *
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe tool features, accessories included (e.g. 10 drill bits, chuck key, carry case), and usage instructions..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Pricing Row (₹/hr, ₹/day, Security Deposit) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200">
            <div>
              <label className="block font-bold text-emerald-900 mb-1">
                Rental Price / Hour (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="5"
                required
                value={formData.pricePerHour}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: e.target.value }))}
                className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-emerald-900 mb-1">
                Rental Price / Day (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="10"
                required
                value={formData.pricePerDay}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePerDay: e.target.value }))}
                className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-emerald-900 mb-1">
                Security Deposit (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={formData.securityDeposit}
                onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: e.target.value }))}
                className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Image Selection & Upload */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Equipment Photograph
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-300 shrink-0">
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-2 w-full">
                <label className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-xl cursor-pointer transition-colors border border-slate-200">
                  <Upload size={14} />
                  <span>Upload from Computer</span>
                  <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                </label>
                <div className="text-[11px] text-slate-400">
                  Or pick a realistic equipment preset:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: preset.url }))}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        formData.image === preset.url
                          ? 'bg-brand-600 text-white border-brand-600 font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Location / Neighbourhood */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Neighbourhood / Colony *
              </label>
              <input
                type="text"
                required
                value={formData.neighbourhood}
                onChange={(e) => setFormData(prev => ({ ...prev, neighbourhood: e.target.value }))}
                placeholder="e.g. Indiranagar 4th Block"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                PIN Code *
              </label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                placeholder="e.g. 560038"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-md shadow-brand-500/20 transition-all cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
