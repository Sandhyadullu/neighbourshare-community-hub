import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getEquipment } from '../../services/db';
import EquipmentCard from '../equipment/EquipmentCard';
import { MapPin, Sparkles, Navigation } from 'lucide-react';

export default function EquipmentNearYou() {
  const { currentUser, setActiveTab, setSearchFilters, refreshTick } = useApp();
  const [selectedArea, setSelectedArea] = useState('All');

  const areas = ['All', 'Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield'];

  let nearItems = getEquipment({
    availability: 'available',
    neighbourhood: selectedArea === 'All' ? '' : selectedArea
  });

  return (
    <section className="py-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full w-fit border border-emerald-200">
              <Navigation size={13} className="text-emerald-600" />
              <span>Hyper-Local Availability</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Available Equipment Near You
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ready for immediate handover right in your neighbourhood. Privacy-safe approximate locations shown.
            </p>
          </div>

          {/* Area Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedArea === area
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Grid */}
        {nearItems.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8">
            <MapPin className="mx-auto text-slate-400 mb-2" size={32} />
            <h3 className="text-sm font-bold text-slate-700">No equipment found in {selectedArea}</h3>
            <p className="text-xs text-slate-400 mt-1">Be the first to list a tool in this neighbourhood!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {nearItems.slice(0, 4).map((item) => (
              <EquipmentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
