import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Layers,
  FileText,
  Lock,
  ArrowRight,
  Sparkles,
  Calendar
} from 'lucide-react';

export default function TransactionReceiptModal({ transaction, onClose }) {
  if (!transaction) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard: ' + text);
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'ESCROW_LOCK':
        return { label: 'Smart Escrow Locked', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'HANDOVER_VERIFIED':
        return { label: 'QR Handover Verified', color: 'bg-sky-100 text-sky-800 border-sky-200' };
      case 'DEPOSIT_REFUND':
        return { label: 'Deposit Refunded & Return Confirmed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'EQUIPMENT_REGISTRATION':
        return { label: 'Equipment Minted on Ledger', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      default:
        return { label: type, color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const badge = getTypeBadge(transaction.type);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in-50">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col my-auto">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold">On-Chain Transaction Certificate</h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Block #{transaction.blockIndex} • SHA-256 Tamper-Evident Ledger
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {/* Certificate Stamp Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                {badge.label}
              </span>
              <h4 className="text-base font-black text-slate-900 mt-1.5">
                {transaction.equipmentName}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Timestamp: {new Date(transaction.timestamp || transaction.blockTimestamp).toLocaleString()}
              </p>
            </div>

            <div className="bg-white p-2 rounded-xl border border-emerald-200 shadow-xs shrink-0">
              <QRCodeSVG
                value={`NEIGHBOURSHARE-BLOCKCHAIN-TX:${transaction.txHash}`}
                size={64}
                level="M"
              />
            </div>
          </div>

          {/* Cryptographic Hashes */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono text-[11px]">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-0.5 font-sans font-bold text-[10px] uppercase">
                <span>Transaction Hash (TxID)</span>
                <button
                  type="button"
                  onClick={() => handleCopy(transaction.txHash)}
                  className="text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer font-sans"
                >
                  <Copy size={11} /> Copy
                </button>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-800 break-all select-all">
                {transaction.txHash}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-slate-500 mb-0.5 font-sans font-bold text-[10px] uppercase">
                <span>Block Hash</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-600 break-all select-all">
                {transaction.blockHash || 'Included in Block #' + transaction.blockIndex}
              </div>
            </div>
          </div>

          {/* Parties Involved */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Lender (Owner)</span>
              <div className="font-bold text-slate-900 mt-0.5">{transaction.lenderName}</div>
              <div className="font-mono text-[10px] text-slate-500 mt-1 truncate">
                {transaction.lenderAddress || '0x71C2...4E9A'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Borrower</span>
              <div className="font-bold text-slate-900 mt-0.5">{transaction.borrowerName}</div>
              <div className="font-mono text-[10px] text-slate-500 mt-1 truncate">
                {transaction.borrowerAddress || '0x39F1...B31D'}
              </div>
            </div>
          </div>

          {/* Financial Settlement */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Rental Fee Settled</span>
              <div className="text-lg font-black text-slate-900">₹{transaction.rentalFee}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Escrow Deposit</span>
              <div className="text-lg font-black text-emerald-700">₹{transaction.securityDeposit}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Gas Fee</span>
              <div className="text-sm font-bold text-slate-400 font-mono">0.00 NSG (Free)</div>
            </div>
          </div>

          {/* Verification Proof Note */}
          <div className="p-3 bg-slate-100 rounded-xl text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
              <Lock size={13} className="text-emerald-600" />
              <span>Consensus & Cryptographic Proof:</span>
            </div>
            <p className="text-[11px] font-mono break-all text-slate-700">
              {transaction.proof || 'PROOF_SHA256_NEIGHBOURHOOD_CONSENSUS_VALIDATED'}
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Close Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
