import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getEquipment } from '../../services/db';
import { INITIAL_CATEGORIES } from '../../services/seedData';
import EquipmentCard from './EquipmentCard';
import {
  Search,
  Filter,
  MapPin,
  IndianRupee,
  SlidersHorizontal,
  X,
  PlusCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function EquipmentCatalog() {
  const {
    searchFilters,
    setSearchFilters,
    setModalState,
    setCurrentRole,
    currentUser,
    refreshTick
  } = useApp();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const equipmentList = getEquipment(searchFilters);

  const handleCategoryChange = (catId) => {
    setSearchFilters(prev => ({
      ...prev,
      category: prev.category === catId ? 'all' : catId
    }));
  };

  const handleResetFilters = () => {
    setSearchFilters({
      search: '',
      category: 'all',
      availability: 'all',
      neighbourhood: 'all',
      maxPrice: '',
      sortBy: 'newest'
    });
  };

  const activeFilterCount = [
    searchFilters.search !== '',
    searchFilters.category !== 'all',
    searchFilters.availability !== 'all',
    searchFilters.neighbourhood !== 'all',
    searchFilters.maxPrice !== '',
    searchFilters.sortBy !== 'newest'
  ].filter(Boolean).length;

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Sparkles size={14} />
              <span>Neighbourhood Tool Library</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Explore Available Equipment
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Borrow local gear safely with verified security deposits and instant QR handover.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentRole('owner');
                setModalState(s => ({ ...s, addEquipment: true }));
              }}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>List Your Equipment</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs mb-6">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchFilters.search}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search tools by name, brand or keyword (e.g. Drill, Kärcher, Bosch)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-brand-500 transition-colors"
              />
              {searchFilters.search && (
                <button
                  onClick={() => setSearchFilters(prev => ({ ...prev, search: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Availability Filter */}
            <div className="w-full md:w-44">
              <select
                value={searchFilters.availability}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, availability: e.target.value }))}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="all">Any Availability</option>
                <option value="available">Available Now</option>
                <option value="borrowed">In Use / Reserved</option>
              </select>
            </div>

            {/* Neighbourhood Filter */}
            <div className="w-full md:w-52">
              <select
                value={searchFilters.neighbourhood}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, neighbourhood: e.target.value }))}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="all">All Locations</option>
                <option value="Indiranagar">Indiranagar (560038)</option>
                <option value="Koramangala">Koramangala (560095)</option>
                <option value="HSR Layout">HSR Layout (560102)</option>
                <option value="Whitefield">Whitefield (560066)</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="w-full md:w-48">
              <select
                value={searchFilters.sortBy}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="newest">Sort: Newly Listed</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden w-full py-2.5 px-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2"
            >
              <SlidersHorizontal size={14} />
              <span>More Filters ({activeFilterCount})</span>
            </button>
          </div>

          {/* Category Chips Bar */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSearchFilters(prev => ({ ...prev, category: 'all' }))}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                searchFilters.category === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {INITIAL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  searchFilters.category === cat.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}

            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="ml-auto text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>Reset ({activeFilterCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500 font-medium">
          <div>
            Showing <span className="font-bold text-slate-900">{equipmentList.length}</span> tools in your neighbourhood
          </div>
          <div className="text-[11px] text-slate-400">
            Click on any item to view hourly pricing, condition & send a borrowing request
          </div>
        </div>

        {/* Equipment Grid */}
        {equipmentList.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No matching equipment found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search terms or clearing active filters to see all available tools.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {equipmentList.map((item) => (
              <EquipmentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
