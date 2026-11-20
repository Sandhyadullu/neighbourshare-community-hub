import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getPlatformStats,
  getUsers,
  getEquipment,
  getBorrowingRequests,
  getReports,
  updateReportStatus,
  deleteEquipment,
  updateEquipment
} from '../../services/db';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Wrench,
  CheckCircle,
  AlertTriangle,
  IndianRupee,
  Trash2,
  Check,
  X,
  ExternalLink,
  Search,
  Filter,
  BrainCircuit,
  ArrowRight
} from 'lucide-react';

const MONTHLY_ACTIVITY = [
  { month: 'Jun', requests: 12, value: 4500 },
  { month: 'Jul', requests: 19, value: 7800 },
  { month: 'Aug', requests: 28, value: 12200 },
  { month: 'Sep', requests: 37, value: 18400 },
  { month: 'Oct', requests: 52, value: 26100 },
  { month: 'Nov', requests: 68, value: 34500 }
];

export default function AdminDashboard() {
  const { showToast, refreshData, refreshTick, setActiveTab: setNavActiveTab } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'equipment' | 'reports'
  const [reportResolution, setReportResolution] = useState('');
  const [resolvingReportId, setResolvingReportId] = useState(null);

  const stats = getPlatformStats();
  const users = getUsers();
  const equipment = getEquipment();
  const requests = getBorrowingRequests();
  const reports = getReports();

  const handleResolveReport = (reportId) => {
    updateReportStatus(reportId, 'Resolved', reportResolution.trim() || 'Reviewed and addressed by admin team.');
    showToast('Report marked as Resolved.', 'success');
    setResolvingReportId(null);
    setReportResolution('');
    refreshData();
  };

  const handleDeleteListing = (item) => {
    if (window.confirm(`Admin: Remove listing "${item.name}" from public platform?`)) {
      deleteEquipment(item.id);
      showToast('Equipment removed by admin.', 'info');
      refreshData();
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold mb-2">
              <ShieldCheck size={14} />
              <span>Platform Supervisor Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              NeighbourShare Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Overseeing neighbourhood trust, active loan volumes, equipment moderation and dispute resolution.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setNavActiveTab('ai-prediction')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <BrainCircuit size={16} />
              <span>AI Rental Demand Model</span>
            </button>
          </div>
        </div>

        {/* 6 Key Admin KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Total Users</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Total Equipment</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalEquipment}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="text-[11px] font-bold text-emerald-700 uppercase">Available</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.availableEquipment}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="text-[11px] font-bold text-amber-700 uppercase">Active Loans</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.activeLoansCount}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="text-[11px] font-bold text-purple-700 uppercase">Completed</div>
            <div className="text-2xl font-black text-purple-600 mt-1">{stats.completedLoansCount + 24}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="text-[11px] font-bold text-rose-700 uppercase">Open Issues</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{stats.reportedIssuesCount}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Activity Analytics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'users' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            User Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'equipment' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Equipment Moderation ({equipment.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'reports' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Disputes & Reports</span>
            {stats.reportedIssuesCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {stats.reportedIssuesCount}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-1">Monthly Borrowing Requests</h3>
              <p className="text-xs text-slate-500 mb-6">Growth in neighbourhood equipment borrowing requests</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTHLY_ACTIVITY}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-1">Rental GMV Generated (₹)</h3>
              <p className="text-xs text-slate-500 mb-6">Total monthly value circulated among lenders in rupees</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTHLY_ACTIVITY}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip formatter={(v) => [`₹${v}`, 'Transaction Value']} />
                    <Bar dataKey="value" fill="#059669" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Registered Community Members</h3>
                <p className="text-xs text-slate-500">Identity-verified lenders and borrowers across active clusters</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-6">Member</th>
                    <th className="py-3 px-6">Neighbourhood</th>
                    <th className="py-3 px-6">Mobile</th>
                    <th className="py-3 px-6">Trust Score</th>
                    <th className="py-3 px-6">Rating</th>
                    <th className="py-3 px-6">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <img src={u.avatar} alt={u.fullName} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <div className="font-bold text-slate-900">{u.fullName}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700">
                        {u.neighbourhood} ({u.pincode})
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-600">
                        {u.mobile}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-black text-emerald-700">{u.trustScore || 95}%</span>
                      </td>
                      <td className="py-4 px-6 font-bold text-amber-600">
                        ★ {u.rating || 5.0} ({u.ratingCount || 0})
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                          <CheckCircle size={11} /> Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: EQUIPMENT MODERATION */}
        {activeTab === 'equipment' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Catalogue Moderation</h3>
              <p className="text-xs text-slate-500">Oversee active listings, ensure safety compliance, and remove violative gear</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-6">Equipment</th>
                    <th className="py-3 px-6">Category</th>
                    <th className="py-3 px-6">Owner</th>
                    <th className="py-3 px-6">Rates</th>
                    <th className="py-3 px-6">Deposit</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {equipment.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-6 flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        <span className="font-bold text-slate-900 truncate max-w-xs">{item.name}</span>
                      </td>
                      <td className="py-3 px-6 text-slate-600 capitalize">
                        {item.category?.replace('-', ' ')}
                      </td>
                      <td className="py-3 px-6 text-slate-800 font-medium">
                        {item.ownerName}
                      </td>
                      <td className="py-3 px-6 font-bold text-slate-900">
                        ₹{item.pricePerHour}/hr (₹{item.pricePerDay}/day)
                      </td>
                      <td className="py-3 px-6 text-emerald-700 font-semibold">
                        ₹{item.securityDeposit || 0}
                      </td>
                      <td className="py-3 px-6">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.isAvailable ? 'Available' : 'On Loan'}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <button
                          onClick={() => handleDeleteListing(item)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="Delist Equipment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DISPUTES & REPORTS */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Reported Issues & Grievances</h3>
            {reports.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                Zero open complaints! The community is operating smoothly.
              </p>
            ) : (
              <div className="space-y-3">
                {reports.map((rep) => (
                  <div key={rep.id} className="p-4 rounded-2xl border border-slate-200 text-xs bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <AlertTriangle size={15} className="text-rose-500" />
                        <span>{rep.targetTitle}</span>
                        <span className="text-slate-400 font-normal">({rep.targetType})</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        rep.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rep.status}
                      </span>
                    </div>

                    <p className="text-slate-600 leading-relaxed">
                      "{rep.description}"
                    </p>

                    <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
                      <span>Reported by {rep.reportedByName} • {new Date(rep.createdAt).toLocaleDateString()}</span>
                      {rep.status !== 'Resolved' && (
                        <button
                          onClick={() => setResolvingReportId(rep.id)}
                          className="font-bold text-purple-700 hover:text-purple-800 underline cursor-pointer"
                        >
                          Resolve Issue
                        </button>
                      )}
                    </div>

                    {resolvingReportId === rep.id && (
                      <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                        <input
                          type="text"
                          value={reportResolution}
                          onChange={(e) => setReportResolution(e.target.value)}
                          placeholder="Action taken / resolution note..."
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setResolvingReportId(null)}
                            className="px-3 py-1 text-slate-500"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleResolveReport(rep.id)}
                            className="px-3 py-1 bg-purple-600 text-white rounded-lg font-bold"
                          >
                            Confirm Resolved
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
