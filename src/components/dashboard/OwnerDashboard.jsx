import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getEquipment,
  getBorrowingRequests,
  updateBorrowingRequest,
  updateEquipment,
  deleteEquipment,
  getReviews
} from '../../services/db';
import RatingStars from '../common/RatingStars';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  PlusCircle,
  Edit3,
  Trash2,
  QrCode,
  MessageCircle,
  Calendar,
  User,
  ArrowUpRight,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Check,
  X,
  BrainCircuit,
  ArrowRight
} from 'lucide-react';

export default function OwnerDashboard() {
  const {
    currentUser,
    setModalState,
    setSelectedEquipment,
    showToast,
    refreshData,
    refreshTick,
    setActiveTab: setNavActiveTab
  } = useApp();

  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'equipment' | 'loans' | 'earnings' | 'reviews'
  const [rejectModalReq, setRejectModalReq] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  if (!currentUser) return null;

  // Fetch owner data
  const myEquipment = getEquipment({ ownerId: currentUser.id });
  const allRequests = getBorrowingRequests(currentUser.id, 'owner');

  const pendingRequests = allRequests.filter(r => r.status === 'Pending');
  const activeLoans = allRequests.filter(r => r.status === 'Borrowed');
  const acceptedRequests = allRequests.filter(r => r.status === 'Accepted');
  const completedLoans = allRequests.filter(r => r.status === 'Returned');

  const totalEarnings = allRequests
    .filter(r => ['Borrowed', 'Returned'].includes(r.status))
    .reduce((sum, r) => sum + (Number(r.calculatedFee) || 0), 0);

  const availableCount = myEquipment.filter(e => e.isAvailable).length;
  const borrowedCount = myEquipment.filter(e => !e.isAvailable).length;

  const reviewsReceived = getReviews().filter(r => r.ownerId === currentUser.id);

  // Accept request action
  const handleAcceptRequest = (req) => {
    updateBorrowingRequest(req.id, 'Accepted', {
      ownerAcceptedAt: new Date().toISOString()
    });
    showToast(`Request from ${req.borrowerName} accepted! Prepare handover QR code.`, 'success');
    refreshData();
  };

  // Reject request action
  const handleRejectRequest = (e) => {
    e.preventDefault();
    if (!rejectModalReq) return;
    updateBorrowingRequest(rejectModalReq.id, 'Rejected', {
      rejectReason: rejectReason.trim() || 'Tool temporarily undergoing maintenance'
    });
    showToast(`Request from ${rejectModalReq.borrowerName} declined.`, 'info');
    setRejectModalReq(null);
    setRejectReason('');
    refreshData();
  };

  // Toggle equipment availability
  const handleToggleAvailability = (item) => {
    const updated = updateEquipment(item.id, { isAvailable: !item.isAvailable });
    showToast(
      `"${item.name}" marked as ${updated.isAvailable ? 'Available for loan' : 'Temporarily Unavailable'}`,
      'info'
    );
    refreshData();
  };

  // Delete equipment
  const handleDeleteEquipment = (item) => {
    if (window.confirm(`Are you sure you want to remove "${item.name}" from your listings?`)) {
      deleteEquipment(item.id);
      showToast('Equipment removed from your catalogue.', 'info');
      refreshData();
    }
  };

  // Open Handover QR Modal
  const handleOpenHandoverQR = (req) => {
    setModalState(s => ({
      ...s,
      qrCode: true,
      qrType: 'handover',
      selectedRequest: req
    }));
  };

  // Open Return verification QR Modal
  const handleOpenReturnQR = (req) => {
    setModalState(s => ({
      ...s,
      qrCode: true,
      qrType: 'return',
      selectedRequest: req
    }));
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.fullName}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-100"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900">
                    {currentUser.fullName}
                  </h1>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                    Owner Dashboard
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  📍 {currentUser.neighbourhood} • Member since {currentUser.joinedDate || '2025'}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <RatingStars rating={currentUser.rating || 5.0} count={currentUser.ratingCount || 12} size="xs" />
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck size={13} />
                    Trust Score: {currentUser.trustScore || 98}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setModalState(s => ({ ...s, addEquipment: true, editEquipment: null }))}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-3 rounded-2xl shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle size={18} />
                <span>Add New Equipment</span>
              </button>
            </div>
          </div>

          {/* 6 Key Owner Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Total Listed</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {myEquipment.length}
              </div>
            </div>

            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200">
              <div className="text-xs text-emerald-800 font-medium">Available Now</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
                {availableCount}
              </div>
            </div>

            <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200">
              <div className="text-xs text-amber-800 font-medium">On Active Loan</div>
              <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1">
                {borrowedCount}
              </div>
            </div>

            <div className="bg-sky-50/60 p-3.5 rounded-2xl border border-sky-200">
              <div className="text-xs text-sky-800 font-medium">Pending Requests</div>
              <div className="text-xl sm:text-2xl font-black text-sky-700 mt-1">
                {pendingRequests.length}
              </div>
            </div>

            <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200">
              <div className="text-xs text-purple-800 font-medium">Completed Loans</div>
              <div className="text-xl sm:text-2xl font-black text-purple-700 mt-1">
                {completedLoans.length}
              </div>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-2xl text-white">
              <div className="text-xs text-slate-400 font-medium">Total Earnings</div>
              <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                ₹{totalEarnings.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* AI Equipment Demand Insight Banner */}
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-white rounded-2xl p-4 border border-indigo-200 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <BrainCircuit size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <span>AI Equipment Rental Demand Forecast</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-mono">Random Forest Regressor</span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Custom ML model projects <strong>63.5 units</strong> demand this week with peak demand in <strong>Pipe pressing machines & Dehumidifiers</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setNavActiveTab('ai-prediction')}
            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Explore Demand Forecast</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Dashboard Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Borrowing Requests</span>
            {pendingRequests.length > 0 && (
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'equipment'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>My Equipment Listings ({myEquipment.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('loans')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'loans'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Active Loans & Returns ({activeLoans.length + acceptedRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'earnings'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Earnings & History</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Ratings & Reviews ({reviewsReceived.length})</span>
          </button>
        </div>

        {/* TAB 1: PENDING BORROWING REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <Clock size={36} className="mx-auto text-slate-300 mb-2" />
                <h3 className="text-base font-bold text-slate-800">No pending borrowing requests</h3>
                <p className="text-xs text-slate-500 mt-1">
                  When neighbours in your area request your tools, they will appear here for your review and approval.
                </p>
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={req.equipmentImage}
                      alt={req.equipmentName}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase">
                          Action Required
                        </span>
                        <span className="text-xs text-slate-400">Req #{req.id}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{req.equipmentName}</h3>
                      <p className="text-xs text-slate-600">
                        Requested by <span className="font-bold text-slate-900">{req.borrowerName}</span> (★ {req.borrowerRating} • Trust {req.borrowerTrustScore}%)
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Calendar size={13} className="text-brand-600" />
                          {new Date(req.startDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} to {new Date(req.endDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>•</span>
                        <span>Duration: {req.durationText}</span>
                        <span>•</span>
                        <span className="font-bold text-slate-900">Rental Fee: ₹{req.calculatedFee}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">Deposit: ₹{req.securityDeposit}</span>
                      </div>
                      {req.purposeNote && (
                        <p className="text-xs bg-slate-50 p-2 rounded-xl text-slate-600 border border-slate-100 mt-2">
                          <span className="font-bold text-slate-800">Borrower note:</span> "{req.purposeNote}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Accept / Reject Action Buttons */}
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleAcceptRequest(req)}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check size={15} />
                      <span>Accept Request</span>
                    </button>
                    <button
                      onClick={() => setRejectModalReq(req)}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <X size={15} />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: MY EQUIPMENT LISTINGS */}
        {activeTab === 'equipment' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEquipment.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-3">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.isAvailable ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {item.isAvailable ? 'Available' : 'Reserved / Out'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="uppercase font-bold text-[10px] text-slate-500">{item.category}</span>
                      <span>★ {item.rating} ({item.reviewCount})</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>

                    <div className="mt-3 flex items-baseline gap-2 text-xs">
                      <span className="text-sm font-black text-slate-900">₹{item.pricePerHour}/hr</span>
                      <span className="text-slate-400">• ₹{item.pricePerDay}/day</span>
                      <span className="text-slate-400">• Deposit: ₹{item.securityDeposit}</span>
                    </div>
                  </div>

                  {/* Listing Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border flex items-center gap-1 cursor-pointer transition-colors ${
                        item.isAvailable
                          ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}
                      title="Toggle availability"
                    >
                      {item.isAvailable ? 'Pause Listing' : 'Make Available'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setModalState(s => ({
                            ...s,
                            addEquipment: false,
                            editEquipment: item
                          }));
                        }}
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg cursor-pointer"
                        title="Edit tool"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteEquipment(item)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Delete tool"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVE LOANS & RETURNS */}
        {activeTab === 'loans' && (
          <div className="space-y-4">
            {[...acceptedRequests, ...activeLoans].length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <CheckCircle2 size={36} className="mx-auto text-slate-300 mb-2" />
                <h3 className="text-base font-bold text-slate-800">No active loans right now</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Once a request is accepted, use the QR Handover verification to deliver the tool safely to the borrower.
                </p>
              </div>
            ) : (
              [...acceptedRequests, ...activeLoans].map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4">
                    <img src={req.equipmentImage} alt={req.equipmentName} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          req.status === 'Accepted' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {req.status === 'Accepted' ? 'Awaiting Handover' : 'Active Loan in Progress'}
                        </span>
                        <span className="text-xs text-slate-400">PIN: {req.handoverOtp}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{req.equipmentName}</h4>
                      <p className="text-xs text-slate-600">
                        Borrower: <span className="font-bold text-slate-900">{req.borrowerName}</span> ({req.borrowerMobile || '+91 98XXX XXXXX'})
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Due Return: <span className="font-bold text-slate-800">{new Date(req.endDate).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'Accepted' ? (
                      <button
                        onClick={() => handleOpenHandoverQR(req)}
                        className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <QrCode size={16} />
                        <span>Show Handover QR</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenReturnQR(req)}
                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 size={16} />
                        <span>Verify Return & Refund Deposit</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: EARNINGS & COMPLETED LOANS */}
        {activeTab === 'earnings' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Rental Income & Transaction Ledger</h3>
                <p className="text-xs text-slate-500">All successful loans and rental settlements in Indian Rupees (₹)</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Lifetime Earnings</span>
                <div className="text-xl font-black text-emerald-700">₹{totalEarnings}</div>
              </div>
            </div>

            {completedLoans.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                Completed transactions will be archived here with receipts.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {completedLoans.map((loan) => (
                  <div key={loan.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{loan.equipmentName}</div>
                      <div className="text-slate-500 text-[11px]">
                        Borrowed by {loan.borrowerName} • Returned {new Date(loan.returnedAt || loan.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="font-bold text-emerald-700">+ ₹{loan.calculatedFee}</div>
                        <div className="text-[10px] text-slate-400">Settled (Simulated)</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNavActiveTab('blockchain')}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer font-mono"
                      >
                        Ledger 🔗
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: RATINGS & REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Reviews from Neighbours ({reviewsReceived.length})
            </h3>
            {reviewsReceived.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                No reviews yet. Keep sharing to receive ratings from satisfied neighbours!
              </p>
            ) : (
              <div className="space-y-3">
                {reviewsReceived.map((r) => (
                  <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <img src={r.borrowerAvatar} alt={r.borrowerName} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <span className="font-bold text-slate-900">{r.borrowerName}</span>
                          <span className="text-slate-400 text-[10px] ml-2">for {r.equipmentName}</span>
                        </div>
                      </div>
                      <RatingStars rating={r.rating} size="xs" />
                    </div>
                    <p className="text-slate-700 leading-relaxed italic">
                      "{r.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reject Request Reason Modal */}
        {rejectModalReq && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
              <h3 className="text-base font-bold text-slate-900">Decline Borrowing Request</h3>
              <p className="text-xs text-slate-500 mt-1">
                Let {rejectModalReq.borrowerName} know why you cannot fulfill this loan right now.
              </p>
              <form onSubmit={handleRejectRequest} className="mt-4 space-y-3">
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Currently in personal use this weekend, or undergoing blade renewal..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectModalReq(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
                  >
                    Confirm Decline
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
