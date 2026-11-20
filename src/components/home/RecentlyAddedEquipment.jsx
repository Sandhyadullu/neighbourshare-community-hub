import React from 'react';
import { useApp } from '../../context/AppContext';
import { getEquipment } from '../../services/db';
import EquipmentCard from '../equipment/EquipmentCard';
import { Clock, ArrowRight } from 'lucide-react';

export default function RecentlyAddedEquipment() {
  const { setActiveTab, setSearchFilters, refreshTick } = useApp();
  const allEquipment = getEquipment({ sortBy: 'newest' });
  const recentItems = allEquipment.slice(0, 4);

  return (
    <section className="py-14 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Clock size={14} />
              <span>Fresh in the Community</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Recently Added Equipment
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              New household gear and electrical tools shared by neighbours this week.
            </p>
          </div>

          <button
            onClick={() => {
              setSearchFilters(prev => ({ ...prev, sortBy: 'newest' }));
              setActiveTab('browse');
            }}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group cursor-pointer"
          >
            <span>Explore all tools</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentItems.map((item) => (
            <EquipmentCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
