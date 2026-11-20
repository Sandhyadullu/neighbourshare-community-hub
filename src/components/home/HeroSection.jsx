import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_CATEGORIES } from '../../services/seedData';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PiggyBank,
  Wrench,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function HeroSection() {
  const { setActiveTab, setSearchFilters, searchFilters, setCurrentRole, setModalState } = useApp();
  const [localSearch, setLocalSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedLoc, setSelectedLoc] = useState('all');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchFilters(prev => ({
      ...prev,
      search: localSearch,
      category: selectedCat,
      neighbourhood: selectedLoc
    }));
    setActiveTab('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 pt-10 pb-16 lg:pt-16 lg:pb-24">
      {/* Decorative blurred background orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 blur-3xl -z-10">
        <div className="absolute -top-10 left-10 w-72 h-72 rounded-full bg-emerald-400"></div>
        <div className="absolute top-20 right-10 w-80 h-80 rounded-full bg-sky-300"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs">
            <Sparkles size={14} className="text-emerald-600 animate-spin-slow" />
            <span>Smart Neighbourhood Equipment Sharing Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
            Share More,{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">
              Spend Less,
            </span>{' '}
            Live Better.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            Need a drilling machine for 30 minutes? Or a pressure washer for the weekend?
            Borrow high-quality tools from trusted neighbours nearby, or monetize your idle gear safely.
          </p>

          {/* Search Bar Container */}
          <div className="pt-2 max-w-4xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-2 sm:p-3 rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200/90 flex flex-col md:flex-row items-center gap-2"
            >
              {/* Tool Keyword Input */}
              <div className="flex-1 flex items-center gap-3 px-3 w-full py-1">
                <Search className="text-emerald-600 shrink-0" size={20} />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="What tool do you need? (e.g. Drill, Ladder, Pressure Washer)..."
                  className="w-full text-sm font-medium text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                />
              </div>

              {/* Category Picker */}
              <div className="w-full md:w-48 px-3 border-t md:border-t-0 md:border-l border-slate-200 py-1 flex items-center gap-2">
                <Wrench className="text-slate-400 shrink-0" size={16} />
                <select
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {INITIAL_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Neighbourhood Selector */}
              <div className="w-full md:w-52 px-3 border-t md:border-t-0 md:border-l border-slate-200 py-1 flex items-center gap-2">
                <MapPin className="text-emerald-600 shrink-0" size={16} />
                <select
                  value={selectedLoc}
                  onChange={(e) => setSelectedLoc(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="all">All Neighbourhoods</option>
                  <option value="Indiranagar">Indiranagar (560038)</option>
                  <option value="Koramangala">Koramangala (560095)</option>
                  <option value="HSR Layout">HSR Layout (560102)</option>
                  <option value="Whitefield">Whitefield (560066)</option>
                </select>
              </div>

              {/* Search Submit Button */}
              <button
                type="submit"
                className="w-full md:w-auto bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-brand-500/30 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Find Tools</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* Quick Category Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-500">Popular searches:</span>
            {['Drill Machine', 'Pressure Washer', 'Toolkit', 'Grass Trimmer', 'Ladder'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setLocalSearch(tag);
                  setSearchFilters(prev => ({ ...prev, search: tag }));
                  setActiveTab('browse');
                }}
                className="bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer shadow-2xs"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Key Value Propositions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <PiggyBank size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Save up to 90% Cost</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Rent for ₹20/hr instead of buying an expensive tool for ₹5,000</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">QR Handover & Deposit</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Secure OTP/QR verification and automatic deposit protection</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">100% Local Neighbours</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Pick up within walking distance in your residential area</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
