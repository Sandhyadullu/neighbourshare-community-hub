import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { updateBorrowingRequest, addReview } from '../../services/db';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  X,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Camera,
  ArrowRight,
  ThumbsUp,
  KeyRound
} from 'lucide-react';

export default function QRCodeModal() {
  const { modalState, setModalState, showToast, refreshData, currentUser } = useApp();
  const request = modalState.selectedRequest;
  const isReturn = modalState.qrType === 'return';

  const [enteredOtp, setEnteredOtp] = useState('');
  const [conditionNote, setConditionNote] = useState('Item checked. Clean, intact, all attachments present.');
  const [returnRating, setReturnRating] = useState(5);
  const [returnReview, setReturnReview] = useState('');
  const [step, setStep] = useState('code'); // 'code' | 'review' | 'success'

  if (!modalState.qrCode || !request) return null;

  const handleClose = () => {
    setModalState(s => ({ ...s, qrCode: false, selectedRequest: null }));
    setStep('code');
  };

  const currentOtp = isReturn ? (request.returnOtp || 'NS-9900') : request.handoverOtp;

  const handleConfirmAction = () => {
    if (isReturn) {
      // Complete return
      updateBorrowingRequest(request.id, 'Returned', {
        returnedAt: new Date().toISOString(),
        returnConditionNote: conditionNote,
        paymentStatus: 'Refunded Deposit'
      });

      // Submit review if provided
      if (returnReview.trim()) {
        addReview({
          equipmentId: request.equipmentId,
          equipmentName: request.equipmentName,
          borrowerName: request.borrowerName,
          borrowerAvatar: request.borrowerAvatar,
          ownerId: request.ownerId,
          rating: returnRating,
          comment: returnReview.trim()
        });
      }

      // Celebrate
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      showToast(`Equipment return verified! Security deposit of ₹${request.securityDeposit} refunded.`, 'success');
    } else {
      // Complete handover
      updateBorrowingRequest(request.id, 'Borrowed', {
        handoverConfirmedAt: new Date().toISOString(),
        conditionPreNote: conditionNote
      });

      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 }
      });

      showToast(`Handover verified! Loan is now active. Return due: ${new Date(request.endDate).toLocaleString()}`, 'success');
    }

    refreshData();
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in-50">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${isReturn ? 'bg-purple-100 text-purple-700' : 'bg-brand-100 text-brand-700'} flex items-center justify-center`}>
              <QrCode size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isReturn ? 'Confirm Equipment Return' : 'Confirm Equipment Handover'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Transaction ID: {request.id}
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

        {/* Content */}
        <div className="p-6 text-center space-y-5">
          {/* Item Mini Card */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left">
            <img
              src={request.equipmentImage}
              alt={request.equipmentName}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="flex-1 truncate">
              <h4 className="text-xs font-bold text-slate-900 truncate">{request.equipmentName}</h4>
              <p className="text-[11px] text-slate-500">
                Borrower: <span className="font-semibold text-slate-700">{request.borrowerName}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-brand-600">₹{request.totalAmount}</span>
              <span className="block text-[9px] text-slate-400">Total</span>
            </div>
          </div>

          {/* Dynamic QR Code Card */}
          <div className="bg-gradient-to-b from-slate-50 to-white p-6 rounded-2xl border border-slate-200/90 shadow-inner flex flex-col items-center">
            <div className="p-3 bg-white rounded-xl shadow-md border border-slate-200">
              <QRCodeSVG
                value={`NEIGHBOURSHARE:${request.id}:${isReturn ? 'RETURN' : 'HANDOVER'}:${currentOtp}`}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="mt-4">
              <div className="text-[11px] text-slate-500 font-medium">
                Scan using camera or enter 6-digit confirmation PIN:
              </div>
              <div className="mt-1.5 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-1.5 rounded-xl font-mono text-base font-black tracking-wider">
                <KeyRound size={16} />
                <span>{currentOtp}</span>
              </div>
            </div>
          </div>

          {/* Condition Check Note */}
          <div className="text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700">
              {isReturn ? 'Return Condition & Attachment Check' : 'Pre-Handover Condition Checklist'}
            </label>
            <input
              type="text"
              value={conditionNote}
              onChange={(e) => setConditionNote(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800"
            />
          </div>

          {/* If return, ask for review */}
          {isReturn && (
            <div className="text-left space-y-2 pt-1 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-700">
                Leave a quick review for the lender:
              </label>
              <textarea
                rows={2}
                value={returnReview}
                onChange={(e) => setReturnReview(e.target.value)}
                placeholder="How was the equipment condition and handover experience?"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
              />
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleConfirmAction}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>
                {isReturn ? 'Confirm Return & Release Deposit' : 'Verify Handover & Start Loan'}
              </span>
            </button>
            <p className="text-[10px] text-slate-400 mt-2">
              Both parties must be present at the handover location.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
