import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getBorrowingRequests,
  getEquipment,
  updateBorrowingRequest,
  addReview
} from '../../services/db';
import RatingStars from '../common/RatingStars';
import EquipmentCard from '../equipment/EquipmentCard';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Calendar,
  IndianRupee,
  Receipt,
  Heart,
  MessageCircle,
  ThumbsUp,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export default function BorrowerDashboard() {
  const {
    currentUser,
    setModalState,
    setSelectedEquipment,
    favourites,
    setActiveTab: setNavActiveTab,
    showToast,
    refreshData,
    refreshTick
  } = useApp();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'requests' | 'saved' | 'transactions' | 'reviews'
  const [reviewModalReq, setReviewModalReq] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  if (!currentUser) return null;

  // Fetch borrower requests
  const myRequests = getBorrowingRequests(currentUser.id, 'borrower');
  const allEquipment = getEquipment();

  const pendingRequests = myRequests.filter(r => r.status === 'Pending');
  const approvedRequests = myRequests.filter(r => r.status === 'Accepted');
  const activeLoans = myRequests.filter(r => r.status === 'Borrowed');
  const completedLoans = myRequests.filter(r => r.status === 'Returned');

  const totalSpent = myRequests
    .filter(r => ['Borrowed', 'Returned'].includes(r.status))
    .reduce((sum, r) => sum + (Number(r.calculatedFee) || 0), 0);

  const savedEquipmentItems = allEquipment.filter(e => favourites.includes(e.id));

  // Request Return Action
  const handleInitiateReturn = (req) => {
    setModalState(s => ({
      ...s,
      qrCode: true,
      qrType: 'return',
      selectedRequest: req
    }));
  };

  // Show Handover QR for accepted request
  const handleShowHandoverQR = (req) => {
    setModalState(s => ({
      ...s,
      qrCode: true,
      qrType: 'handover',
      selectedRequest: req
    }));
  };

  // Submit Review for completed loan
  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewModalReq) return;

    addReview({
      equipmentId: reviewModalReq.equipmentId,
      equipmentName: reviewModalReq.equipmentName,
      borrowerName: currentUser.fullName,
      borrowerAvatar: currentUser.avatar,
      ownerId: reviewModalReq.ownerId,
      rating: reviewRating,
      comment: reviewComment.trim() || 'Great equipment and pleasant neighbourhood exchange!'
    });

    updateBorrowingRequest(reviewModalReq.id, 'Returned', {
      borrowerReviewGiven: true
    });

    showToast('Review submitted! Thank you for strengthening community trust.', 'success');
    setReviewModalReq(null);
    setReviewComment('');
    refreshData();
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.fullName}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-sky-100"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900">
                    {currentUser.fullName}
                  </h1>
                  <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full uppercase">
                    Borrower Dashboard
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  📍 {currentUser.neighbourhood} • Trust Rating: {currentUser.rating || 5.0} ★
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active Borrower Score: {currentUser.trustScore || 96}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setNavActiveTab('browse')}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-3 rounded-2xl shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Browse More Tools</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Metrics Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Total Requests</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {myRequests.length}
              </div>
            </div>

            <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200">
              <div className="text-xs text-amber-800 font-medium">Pending Approval</div>
              <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1">
                {pendingRequests.length}
              </div>
            </div>

            <div className="bg-sky-50/60 p-3.5 rounded-2xl border border-sky-200">
              <div className="text-xs text-sky-800 font-medium">Approved / Ready</div>
              <div className="text-xl sm:text-2xl font-black text-sky-700 mt-1">
                {approvedRequests.length}
              </div>
            </div>

            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200">
              <div className="text-xs text-emerald-800 font-medium">Active Loans</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
                {activeLoans.length}
              </div>
            </div>

            <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200">
              <div className="text-xs text-purple-800 font-medium">Completed Returns</div>
              <div className="text-xl sm:text-2xl font-black text-purple-700 mt-1">
                {completedLoans.length}
              </div>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-2xl text-white">
              <div className="text-xs text-slate-400 font-medium">Total Spent</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                ₹{totalSpent.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>My Active Borrowings ({activeLoans.length + approvedRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All Requests ({myRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Saved Equipment ({savedEquipmentItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'transactions'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Transaction History</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE BORROWINGS & HANDOVER READY */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {[...approvedRequests, ...activeLoans].length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <ShoppingBag size={36} className="mx-auto text-slate-300 mb-2" />
                <h3 className="text-base font-bold text-slate-800">No active equipment on loan</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Borrow tools from neighbours when you need them. Browse the catalogue to find equipment near you.
                </p>
                <button
                  onClick={() => setNavActiveTab('browse')}
                  className="mt-4 bg-brand-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Find Equipment
                </button>
              </div>
            ) : (
              [...approvedRequests, ...activeLoans].map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={req.equipmentImage}
                      alt={req.equipmentName}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          req.status === 'Accepted'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {req.status === 'Accepted' ? 'Ready for Pickup' : 'Currently in Your Use'}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          Handover OTP: {req.handoverOtp}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{req.equipmentName}</h3>
                      <p className="text-xs text-slate-600">
                        Owner: <span className="font-semibold text-slate-900">{req.ownerName}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Calendar size={13} className="text-emerald-600" />
                          Return by: {new Date(req.endDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>•</span>
                        <span>Rental fee: ₹{req.calculatedFee}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">Held Deposit: ₹{req.securityDeposit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === 'Accepted' ? (
                      <button
                        onClick={() => handleShowHandoverQR(req)}
                        className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <QrCode size={16} />
                        <span>Show Handover QR & OTP</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInitiateReturn(req)}
                        className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 size={16} />
                        <span>Request Return & Refund</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: ALL BORROWING REQUESTS */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Borrowing Request Log
            </h3>
            {myRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                You haven't requested any equipment yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {myRequests.map((r) => (
                  <div key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={r.equipmentImage} alt={r.equipmentName} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <div className="font-bold text-slate-900">{r.equipmentName}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          Owner: {r.ownerName} • Requested for {r.durationText} • ₹{r.totalAmount} (incl. deposit)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        r.status === 'Accepted'
                          ? 'bg-sky-100 text-sky-800'
                          : r.status === 'Borrowed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'Returned'
                          ? 'bg-purple-100 text-purple-800'
                          : r.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {r.status}
                      </span>

                      {r.status === 'Returned' && !r.borrowerReviewGiven && (
                        <button
                          onClick={() => setReviewModalReq(r)}
                          className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-300 transition-colors cursor-pointer"
                        >
                          ★ Leave Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SAVED / FAVOURITE EQUIPMENT */}
        {activeTab === 'saved' && (
          <div>
            {savedEquipmentItems.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <Heart size={36} className="mx-auto text-slate-300 mb-2" />
                <h3 className="text-base font-bold text-slate-800">No saved tools yet</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Click the heart icon on any equipment card to bookmark it for future DIY projects.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {savedEquipmentItems.map((item) => (
                  <EquipmentCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TRANSACTION HISTORY & RECEIPTS */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Rental Invoices & Security Deposit Refunds</h3>
                <p className="text-xs text-slate-500">Record of simulated payments, GST-exempt neighbourhood sharing invoices</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Total Spent</span>
                <div className="text-xl font-black text-slate-900">₹{totalSpent}</div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {myRequests.map((r) => (
                <div key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{r.equipmentName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Invoice #{r.id}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-1">
                      Rental fee: ₹{r.calculatedFee} • Security Deposit: ₹{r.securityDeposit} ({r.paymentStatus || 'Simulated UPI'})
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end gap-1.5 text-right">
                    <div>
                      <span className="text-sm font-black text-slate-900">₹{r.calculatedFee}</span>
                      <span className="block text-[10px] text-emerald-600 font-semibold">
                        {r.status === 'Returned' ? 'Deposit Refunded ✅' : 'Deposit Active 🛡️'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNavActiveTab('blockchain')}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1 font-mono"
                    >
                      <span>On-Chain Ledger 🔗</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leave Review Modal */}
        {reviewModalReq && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
              <h3 className="text-base font-bold text-slate-900">
                Rate & Review Experience
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                For {reviewModalReq.equipmentName} borrowed from {reviewModalReq.ownerName}.
              </p>

              <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rating
                  </label>
                  <RatingStars
                    rating={reviewRating}
                    size="md"
                    interactive={true}
                    onChange={(r) => setReviewRating(r)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Feedback
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Was the tool clean and ready? How was the handover with the owner?"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalReq(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
