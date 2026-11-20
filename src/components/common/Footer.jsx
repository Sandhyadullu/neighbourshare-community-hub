import React from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_CATEGORIES } from '../../services/seedData';
import { Share2, Heart, Shield, Sparkles, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  const { setActiveTab, setSearchFilters } = useApp();

  const handleCategoryClick = (catId) => {
    setSearchFilters(prev => ({ ...prev, category: catId }));
    setActiveTab('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Share2 size={22} className="stroke-[2.5]" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Neighbour<span className="text-brand-400">Share</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              "Share More, Spend Less, Live Better." A smart hyper-local equipment sharing ecosystem designed to turn idle household tools into neighbourhood resources.
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
                <Shield size={14} className="text-emerald-400" />
                <span>Verified Neighbours</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
                <Sparkles size={14} className="text-amber-400" />
                <span>QR Handover</span>
              </div>
            </div>
          </div>

          {/* Categories Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Equipment Categories</h4>
            <ul className="space-y-2 text-xs">
              {INITIAL_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleCategoryClick(cat.id)}
                    className="hover:text-emerald-400 transition-colors text-slate-400 cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Community & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform & Trust</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveTab('impact')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Sharing Impact Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('community')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Neighbourhood Directory
                </button>
              </li>
              <li>
                <span className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Equipment Safety Protocol
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Security Deposit Protection
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Dispute & Damage Resolution
                </span>
              </li>
            </ul>
          </div>

          {/* Contact & Supported Areas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Neighbourhood Coverage</h4>
            <div className="text-xs text-slate-400 space-y-1.5">
              <p className="flex items-center gap-1.5">
                <MapPin size={13} className="text-emerald-400 shrink-0" />
                <span>Indiranagar • Koramangala</span>
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin size={13} className="text-emerald-400 shrink-0" />
                <span>HSR Layout • Whitefield • Jayanagar</span>
              </p>
              <p className="pt-2 text-[11px] text-slate-500">
                Expanding to residential communities across India.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} NeighbourShare Platform. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with care for cooperative neighbourhood communities</span>
            <Heart size={14} className="fill-rose-500 text-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
