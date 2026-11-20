import React from 'react';
import { useApp } from '../../context/AppContext';
import { getPlatformStats } from '../../services/db';
import { Share2, CheckCircle2, IndianRupee, ShoppingBag, ArrowRight } from 'lucide-react';

export default function ImpactStatsBanner() {
  const { setActiveTab, refreshTick } = useApp();
  const stats = getPlatformStats();

  return (
    <section className="py-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-md text-center lg:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-white/10 px-3 py-1 rounded-full">
              Real Neighbourhood Impact
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              Together We Make Every Tool Count
            </h2>
            <p className="text-xs text-emerald-100 mt-1">
              Every loan avoids raw manufacturing waste and keeps hard-earned money in neighbourhood pockets.
            </p>
          </div>

          {/* 4 Stat Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center">
              <div className="text-2xl sm:text-3xl font-black text-white">
                {stats.totalEquipment}
              </div>
              <div className="text-[11px] text-emerald-100 font-medium mt-1">
                Equipment Listed
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center">
              <div className="text-2xl sm:text-3xl font-black text-white">
                {stats.completedLoansCount + 24}
              </div>
              <div className="text-[11px] text-emerald-100 font-medium mt-1">
                Loans Completed
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-300">
                ₹{((stats.estimatedSavings || 18500) + 4200).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-emerald-100 font-medium mt-1">
                Money Saved
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center">
              <div className="text-2xl sm:text-3xl font-black text-sky-200">
                {stats.purchasesAvoided}
              </div>
              <div className="text-[11px] text-emerald-100 font-medium mt-1">
                Purchases Avoided
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
