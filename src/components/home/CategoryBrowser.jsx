import React from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_CATEGORIES } from '../../services/seedData';
import { getEquipment } from '../../services/db';
import { Zap, Wrench, Trees, Sparkles, Plug, Layers, ArrowUpRight } from 'lucide-react';

export default function CategoryBrowser() {
  const { setActiveTab, setSearchFilters, refreshTick } = useApp();
  const allEquipment = getEquipment();

  // Map icon strings to Lucide components
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Zap': return <Zap className="stroke-[2.2]" size={24} />;
      case 'Wrench': return <Wrench className="stroke-[2.2]" size={24} />;
      case 'Trees': return <Trees className="stroke-[2.2]" size={24} />;
      case 'Sparkles': return <Sparkles className="stroke-[2.2]" size={24} />;
      case 'Plug': return <Plug className="stroke-[2.2]" size={24} />;
      default: return <Layers className="stroke-[2.2]" size={24} />;
    }
  };

  const handleSelectCategory = (categoryId) => {
    setSearchFilters(prev => ({ ...prev, category: categoryId }));
    setActiveTab('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
              Tool Directory
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Browse Equipment Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a category to explore tools currently available in your neighbourhood.
            </p>
          </div>

          <button
            onClick={() => {
              setSearchFilters(prev => ({ ...prev, category: 'all' }));
              setActiveTab('browse');
            }}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group cursor-pointer"
          >
            <span>View All Equipment</span>
            <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* 6 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {INITIAL_CATEGORIES.map((category) => {
            const itemCount = allEquipment.filter(e => e.category === category.id).length;

            return (
              <div
                key={category.id}
                onClick={() => handleSelectCategory(category.id)}
                className="group relative bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-brand-500/50 shadow-xs hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Decorative corner glow */}
                <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-gradient-to-tr ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl`}></div>

                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${category.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    {getIcon(category.icon)}
                  </div>
                  <span className="text-xs font-bold bg-white text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full shadow-2xs group-hover:border-brand-300 group-hover:text-brand-700">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="mt-5">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors flex items-center gap-1.5">
                    {category.name}
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
