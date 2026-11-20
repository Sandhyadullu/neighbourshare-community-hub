import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getBlockchain,
  getAllBlockchainTransactions,
  verifyChainIntegrity,
  recordOnChainTransaction
} from '../../services/blockchain';
import TransactionReceiptModal from './TransactionReceiptModal';
import {
  Link2,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Lock,
  Sparkles,
  AlertCircle,
  Copy,
  ChevronRight,
  RefreshCw,
  Hash,
  Database,
  Cpu
} from 'lucide-react';

export default function BlockchainExplorer() {
  const { refreshTick, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedTx, setSelectedTx] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [auditResult, setAuditResult] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const chain = getBlockchain();
  const allTransactions = getAllBlockchainTransactions();

  // Run integrity audit
  const handleVerifyChain = () => {
    setIsAuditing(true);
    setTimeout(() => {
      const result = verifyChainIntegrity();
      setAuditResult(result);
      setIsAuditing(false);
      if (result.isValid) {
        showToast(`Cryptographic Chain Verified! All ${result.verifiedBlocks} blocks checked. Zero tampering detected.`, 'success');
      } else {
        showToast(result.error, 'error');
      }
    }, 400);
  };

  // Filter transactions
  const filteredTxs = allTransactions.filter((tx) => {
    const matchesSearch =
      !searchQuery.trim() ||
      tx.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.equipmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.lenderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.borrowerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.requestId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'ALL' || tx.type === filterType;

    return matchesSearch && matchesType;
  });

  const totalValueSecured = allTransactions.reduce(
    (sum, t) => sum + (Number(t.securityDeposit) || 0) + (Number(t.rentalFee) || 0),
    0
  );

  const getTypeStyle = (type) => {
    switch (type) {
      case 'ESCROW_LOCK':
        return { label: 'Escrow Locked', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'HANDOVER_VERIFIED':
        return { label: 'QR Handover', bg: 'bg-sky-100 text-sky-800 border-sky-200' };
      case 'DEPOSIT_REFUND':
        return { label: 'Deposit Refunded', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'EQUIPMENT_REGISTRATION':
        return { label: 'Tool Minted', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      default:
        return { label: 'Protocol Genesis', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 py-10 selection:bg-emerald-500 selection:text-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-8 rounded-3xl border border-slate-700/80 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
                <Link2 size={14} className="animate-pulse" />
                <span>Decentralized Neighbourhood Trust Ledger</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Public Blockchain Explorer
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Immutable, cryptographically verifiable records for all equipment escrow locks, QR handovers, returns, and deposit releases. Every block is linked by SHA-256 hashes.
              </p>
            </div>

            {/* Run Integrity Audit Button */}
            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <button
                onClick={handleVerifyChain}
                disabled={isAuditing}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Cpu size={18} />
                <span>{isAuditing ? 'Auditing Hashes...' : 'Verify Cryptographic Integrity'}</span>
              </button>
              <span className="text-[11px] text-slate-400 font-mono">
                Consensus: Proof-of-Trust SHA-256
              </span>
            </div>
          </div>
        </div>

        {/* Audit Status Alert */}
        {auditResult && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between animate-in fade-in-50 ${
            auditResult.isValid
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
          }`}>
            <div className="flex items-center gap-3">
              <ShieldCheck size={22} className="text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">
                  {auditResult.isValid ? 'Chain Integrity: 100% Cryptographically Valid' : 'Integrity Audit Warning'}
                </h4>
                <p className="text-xs opacity-90">
                  {auditResult.isValid
                    ? `All ${auditResult.verifiedBlocks} consecutive blocks verified against SHA-256 parent hash pointers. Zero data tampering detected.`
                    : auditResult.error}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono bg-emerald-900/80 px-3 py-1 rounded-full border border-emerald-700">
              Checked Just Now
            </span>
          </div>
        )}

        {/* 4 Blockchain Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Block Height</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              #{chain.length - 1}
            </div>
            <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
              {chain.length} mined blocks
            </span>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total On-Chain Tx</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {allTransactions.length}
            </div>
            <span className="text-[11px] text-sky-400 font-mono mt-1 block">
              100% Confirmed
            </span>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Secured Escrow Volume</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
              ₹{totalValueSecured.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">
              Protected by smart contract
            </span>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Proof of Trust</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
              SHA-256
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">
              Gas Fee: 0.00 NSG (Free)
            </span>
          </div>
        </div>

        {/* Visual Blockchain Strip */}
        <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Consecutive Block Chain Sequence
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Click any block to inspect cryptographic payload
            </span>
          </div>

          {/* Horizontal scrollable chain */}
          <div className="overflow-x-auto pb-4 pt-2">
            <div className="flex items-center gap-3 min-w-max">
              {chain.map((block, idx) => {
                const isSelected = selectedBlock?.index === block.index;
                return (
                  <React.Fragment key={block.index}>
                    <div
                      onClick={() => setSelectedBlock(isSelected ? null : block)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer w-56 shrink-0 ${
                        isSelected
                          ? 'bg-emerald-950 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105'
                          : 'bg-slate-900/90 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-mono font-black text-white">
                          Block #{block.index}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                          {block.transactions.length} Tx
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono space-y-1">
                        <div className="truncate">
                          <span className="text-slate-500">Hash: </span>
                          <span className="text-emerald-400">{block.hash.substring(0, 10)}...</span>
                        </div>
                        <div className="truncate">
                          <span className="text-slate-500">Prev: </span>
                          <span>{block.previousHash.substring(0, 8)}...</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Nonce: </span>
                          <span>{block.nonce}</span>
                        </div>
                      </div>
                    </div>

                    {idx < chain.length - 1 && (
                      <ArrowRight size={16} className="text-emerald-500/70 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Selected Block Details Inspector Drawer */}
          {selectedBlock && (
            <div className="mt-4 p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 text-xs font-mono space-y-2 animate-in fade-in-50">
              <div className="flex items-center justify-between text-white font-sans font-bold pb-2 border-b border-slate-800">
                <span>Inspecting Block #{selectedBlock.index} Details</span>
                <button onClick={() => setSelectedBlock(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 pt-1">
                <div>
                  <span className="text-slate-500">Block Hash:</span>
                  <div className="break-all text-emerald-400 bg-slate-950 p-2 rounded-lg mt-0.5">{selectedBlock.hash}</div>
                </div>
                <div>
                  <span className="text-slate-500">Previous Hash Pointer:</span>
                  <div className="break-all text-slate-400 bg-slate-950 p-2 rounded-lg mt-0.5">{selectedBlock.previousHash}</div>
                </div>
              </div>
              <div className="pt-2 text-slate-400">
                <span>Timestamp: </span>{selectedBlock.timestamp} • <span>Nonce: </span>{selectedBlock.nonce}
              </div>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Tx Hash, Equipment, Borrower, Lender, or Request ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['ALL', 'ESCROW_LOCK', 'HANDOVER_VERIFIED', 'DEPOSIT_REFUND', 'EQUIPMENT_REGISTRATION'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    filterType === type
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {type === 'ALL' ? 'All Types' : type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-slate-800/80 rounded-3xl border border-slate-700/80 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash size={18} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Confirmed Transaction Records ({filteredTxs.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Click any record to inspect cryptographic certificate
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-5">Tx Hash</th>
                  <th className="py-3 px-5">Block</th>
                  <th className="py-3 px-5">Event Type</th>
                  <th className="py-3 px-5">Equipment</th>
                  <th className="py-3 px-5">Parties (Lender ➔ Borrower)</th>
                  <th className="py-3 px-5">Value (₹)</th>
                  <th className="py-3 px-5 text-right">Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 font-mono">
                {filteredTxs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                      No on-chain transactions match your search filter.
                    </td>
                  </tr>
                ) : (
                  filteredTxs.map((tx) => {
                    const style = getTypeStyle(tx.type);
                    return (
                      <tr
                        key={tx.txHash}
                        onClick={() => setSelectedTx(tx)}
                        className="hover:bg-slate-700/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-5 font-bold text-emerald-400 group-hover:underline">
                          {tx.txHash.substring(0, 10)}...{tx.txHash.substring(tx.txHash.length - 6)}
                        </td>
                        <td className="py-3.5 px-5 text-slate-300">
                          #{tx.blockIndex}
                        </td>
                        <td className="py-3.5 px-5 font-sans">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${style.bg}`}>
                            {style.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-sans font-medium text-white truncate max-w-xs">
                          {tx.equipmentName}
                        </td>
                        <td className="py-3.5 px-5 font-sans text-slate-300">
                          <span className="font-semibold text-white">{tx.lenderName?.split(' ')[0]}</span>
                          <span className="text-slate-500 mx-1.5">➔</span>
                          <span className="font-semibold text-white">{tx.borrowerName?.split(' ')[0]}</span>
                        </td>
                        <td className="py-3.5 px-5 font-sans font-black text-amber-300">
                          ₹{Number(tx.securityDeposit || 0) + Number(tx.rentalFee || 0)}
                        </td>
                        <td className="py-3.5 px-5 text-right font-sans">
                          <span className="text-emerald-400 group-hover:text-emerald-300 font-bold text-[11px] flex items-center justify-end gap-1">
                            <span>Inspect</span>
                            <ChevronRight size={14} />
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Certificate */}
        {selectedTx && (
          <TransactionReceiptModal
            transaction={selectedTx}
            onClose={() => setSelectedTx(null)}
          />
        )}
      </div>
    </div>
  );
}
