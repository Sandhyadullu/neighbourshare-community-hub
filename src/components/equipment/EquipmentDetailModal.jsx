import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getReviews, createBorrowingRequest, getBorrowingRequests } from '../../services/db';
import RatingStars from '../common/RatingStars';
import {
  X,
  MapPin,
  Shield,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Flag,
  Share2,
  IndianRupee,
  Sparkles,
  ArrowRight,
  Info,
  Check
} from 'lucide-react';

export default function EquipmentDetailModal() {
  const {
    selectedEquipment,
    modalState,
    setModalState,
    currentUser,
    openAuth,
    showToast,
    refreshData
  } = useApp();

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });

  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 4, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });

  const [purposeNote, setPurposeNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'reviews'

  if (!modalState.equipmentDetail || !selectedEquipment) return null;

  const item = selectedEquipment;
  const reviews = getReviews(item.id);

  // Automatic Rental Calculation
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = Math.max(0, end - start);
  const diffHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
  const diffDays = Math.ceil(diffHours / 24);

  // If duration is 24+ hours, use day rate, else hourly rate
  const isDaily = diffHours >= 24;
  const rentalFee = isDaily
    ? diffDays * item.pricePerDay
    : diffHours * item.pricePerHour;
  const totalAmount = rentalFee + (item.securityDeposit || 0);

  const durationLabel = isDaily
    ? `${diffDays} day${diffDays > 1 ? 's' : ''} (${diffHours} hrs)`
    : `${diffHours} hour${diffHours > 1 ? 's' : ''}`;

  const handleClose = () => {
    setModalState(s => ({ ...s, equipmentDetail: false }));
  };

  const handleSendRequest = (e) => {
    e.preventDefault();
    if (!currentUser) {
      openAuth('login');
      return;
    }

    if (currentUser.id === item.ownerId) {
      showToast('You cannot borrow your own equipment!', 'error');
      return;
    }

    if (start >= end) {
      showToast('Return time must be after the pickup time.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReq = createBorrowingRequest({
        equipmentId: item.id,
        equipmentName: item.name,
        equipmentImage: item.image,
        borrowerId: currentUser.id,
        borrowerName: currentUser.fullName,
        borrowerAvatar: currentUser.avatar,
        borrowerMobile: currentUser.mobile,
        borrowerRating: currentUser.rating,
        borrowerTrustScore: currentUser.trustScore,
        ownerId: item.ownerId,
        ownerName: item.ownerName,
        startDate,
        endDate,
        durationText: durationLabel,
        calculatedFee: rentalFee,
        securityDeposit: item.securityDeposit || 0,
        totalAmount,
        purposeNote: purposeNote.trim() || 'General home DIY project'
      });

      refreshData();
      handleClose();
      showToast(`Borrowing request sent to ${item.ownerName}! View status in Borrower Dashboard.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to submit request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChat = () => {
    if (!currentUser) {
      openAuth('login');
      return;
    }
    setModalState(s => ({
      ...s,
      messenger: true,
      activeChatRequest: {
        id: `chat_inquiry_${item.id}`,
        equipmentName: item.name,
        ownerName: item.ownerName,
        ownerId: item.ownerId,
        borrowerId: currentUser.id
      }
    }));
  };

  const handleReport = () => {
    setModalState(s => ({
      ...s,
      reportIssue: true,
      reportTarget: {
        type: 'Equipment',
        id: item.id,
        title: item.name
      }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in-50">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col my-auto">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-100/70 px-2.5 py-1 rounded-full border border-brand-200">
              {item.category?.replace('-', ' ')}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">ID: {item.id}</span>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 flex-1 divide-y divide-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-6">
            {/* Left Col: Photograph and Condition */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-sm border ${
                    item.isAvailable ? 'bg-white/95 text-emerald-700 border-emerald-200' : 'bg-amber-500 text-white border-amber-600'
                  }`}>
                    {item.isAvailable ? '● Available for Loan' : '● Currently Reserved'}
                  </span>
                </div>
              </div>

              {/* Condition & Inspection Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                  <span>Equipment Condition</span>
                  <span className="text-emerald-700 font-extrabold">{item.condition}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.conditionDetails || 'Well-maintained, clean, and tested prior to each booking.'}
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center gap-2 text-[11px] text-slate-500">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>Inspected before & after every neighbourhood loan</span>
                </div>
              </div>

              {/* Owner Profile Card */}
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.ownerAvatar}
                      alt={item.ownerName}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-400"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.ownerName}</h4>
                      <p className="text-[11px] text-slate-500">Verified Equipment Lender</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <RatingStars rating={item.ownerRating || 4.9} size="xs" />
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-800">
                      {item.ownerTrustScore || 98}%
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Trust Score</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleOpenChat}
                    className="w-full text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-100 py-1.5 rounded-lg border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <MessageCircle size={14} />
                    <span>Inquire / Message Owner</span>
                  </button>
                </div>
              </div>

              {/* Location & Privacy Notice */}
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <MapPin size={13} className="text-sky-600" />
                  <span>{item.neighbourhood} (Approx {item.approxDistance || 'nearby'})</span>
                </div>
                <p className="text-[11px] text-sky-700 leading-normal">
                  Exact house/apartment address is disclosed once the owner accepts your borrowing request.
                </p>
              </div>
            </div>

            {/* Right Col: Details, Rent Calculator & Request Form */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {item.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <span className="text-base text-brand-600 font-black">₹{item.pricePerHour}</span> / hour
                  </div>
                  <span>•</span>
                  <div className="font-semibold text-slate-700">
                    ₹{item.pricePerDay} / day
                  </div>
                  <span>•</span>
                  <div className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <Shield size={11} />
                    Security Deposit: ₹{item.securityDeposit || 0}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  About this Tool
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Interactive Booking & Rental Calculator Form */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Calendar size={14} className="text-brand-600" />
                    <span>Select Borrowing Window</span>
                  </span>
                  <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    Auto-Calculated
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Pickup Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Return Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Usage Purpose (Optional note for owner)
                  </label>
                  <input
                    type="text"
                    value={purposeNote}
                    onChange={(e) => setPurposeNote(e.target.value)}
                    placeholder="e.g. Assembling wooden bookshelves, washing car on weekend..."
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Live Rental Price Breakdown */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-800 border-b border-slate-100 pb-1.5 flex justify-between">
                    <span>Duration:</span>
                    <span className="text-emerald-700">{durationLabel}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Equipment Rental Charge ({isDaily ? `₹${item.pricePerDay}/day` : `₹${item.pricePerHour}/hr`}):</span>
                    <span className="font-bold text-slate-900">₹{rentalFee}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>Refundable Security Deposit</span>
                      <Info size={11} className="text-slate-400" />
                    </span>
                    <span className="font-bold text-slate-900">₹{item.securityDeposit || 0}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black text-sm text-slate-900">
                    <span>Total Estimated Payment:</span>
                    <span className="text-lg text-brand-600">₹{totalAmount}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-0.5">
                    * The ₹{item.securityDeposit || 0} security deposit is held securely and refunded immediately upon verified return.
                  </p>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={handleSendRequest}
                  disabled={!item.isAvailable || isSubmitting}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    item.isAvailable
                      ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Sparkles size={16} />
                  <span>
                    {isSubmitting ? 'Sending Request...' : item.isAvailable ? 'Send Borrowing Request to Owner' : 'Equipment Currently Booked'}
                  </span>
                  {item.isAvailable && <ArrowRight size={16} />}
                </button>
              </div>

              {/* Bottom Actions: Report / Reviews Tab */}
              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'reviews' ? 'details' : 'reviews')}
                  className="font-bold text-brand-700 hover:text-brand-800 underline cursor-pointer"
                >
                  {activeTab === 'reviews' ? '← Back to Details' : `View Borrower Reviews (${reviews.length})`}
                </button>

                <button
                  type="button"
                  onClick={handleReport}
                  className="text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Flag size={13} />
                  <span>Report an Issue</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Expand Area */}
          {activeTab === 'reviews' && (
            <div className="pt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Borrower Reviews for {item.name}
              </h3>
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No written reviews yet. Be the first neighbour to borrow and review!
                </p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <img src={rev.borrowerAvatar} alt={rev.borrowerName} className="w-6 h-6 rounded-full object-cover" />
                          <span className="font-bold text-slate-800">{rev.borrowerName}</span>
                        </div>
                        <RatingStars rating={rev.rating} size="xs" />
                      </div>
                      <p className="text-slate-600 leading-relaxed mt-1">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
