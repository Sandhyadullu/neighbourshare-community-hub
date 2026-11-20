import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { addReport } from '../../services/db';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function ReportIssueModal() {
  const { modalState, setModalState, currentUser, showToast, refreshData } = useApp();
  const target = modalState.reportTarget;

  const [issueType, setIssueType] = useState('Damaged or Faulty Tool');
  const [description, setDescription] = useState('');

  if (!modalState.reportIssue || !target) return null;

  const handleClose = () => {
    setModalState(s => ({ ...s, reportIssue: false, reportTarget: null }));
    setDescription('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    addReport({
      reportedBy: currentUser.id,
      reportedByName: currentUser.fullName,
      targetType: target.type || 'Equipment',
      targetId: target.id,
      targetTitle: `${issueType}: ${target.title || target.name || 'Listing'}`,
      description: description.trim()
    });

    showToast('Report submitted to NeighbourShare admin team for safety review.', 'info');
    refreshData();
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle size={18} />
            <h3 className="text-sm font-bold text-slate-900">Report an Issue or Dispute</h3>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Issue Category</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-brand-500"
            >
              <option value="Damaged or Faulty Tool">Damaged or Faulty Equipment</option>
              <option value="Missing Parts or Attachments">Missing Parts / Accessories</option>
              <option value="Unresponsive Neighbour">Unresponsive Member at Pickup</option>
              <option value="Inaccurate Condition Description">Item Condition Misrepresented</option>
              <option value="Deposit Dispute">Security Deposit Dispute</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Detailed Description *</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide specifics (e.g. cracked casing, missing safety chuck, delay in return)..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-brand-500"
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
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
