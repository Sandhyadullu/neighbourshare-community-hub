import React from 'react';
import { useApp } from '../../context/AppContext';
import RatingStars from '../common/RatingStars';
import {
  Heart,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function EquipmentCard({ item }) {
  const {
    setSelectedEquipment,
    setModalState,
    favourites,
    handleToggleFavourite,
    currentUser,
    openAuth
  } = useApp();

  const isFav = favourites.includes(item.id);

  const handleCardClick = () => {
    setSelectedEquipment(item);
    setModalState(s => ({ ...s, equipmentDetail: true }));
  };

  const handleQuickBorrow = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      openAuth('login');
      return;
    }
    setSelectedEquipment(item);
    setModalState(s => ({ ...s, borrowRequest: true }));
  };

  // Condition color badge
  const getConditionStyle = (condition) => {
    switch (condition) {
      case 'Like New':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Excellent':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Good':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-brand-500/50 shadow-xs hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          {/* Availability Badge */}
          {item.isAvailable ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/95 text-emerald-700 px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Available Now
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/95 text-white px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
              <Clock size={12} />
              In Use / Reserved
            </span>
          )}

          {/* Favourite Heart */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavourite(item.id);
            }}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-rose-500 flex items-center justify-center shadow-md backdrop-blur-sm transition-transform hover:scale-110 cursor-pointer"
            title="Save to Favourites"
          >
            <Heart
              size={16}
              className={isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}
            />
          </button>
        </div>

        {/* Bottom Condition Pill */}
        <div className="absolute bottom-2.5 left-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-2xs ${getConditionStyle(item.condition)}`}>
            {item.condition}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Approximate Location Notice */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1 font-medium text-slate-600">
              <MapPin size={12} className="text-emerald-600 shrink-0" />
              <span className="truncate max-w-[170px]">{item.neighbourhood}</span>
            </span>
            <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              {item.approxDistance || 'Nearby'}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-1">
            {item.name}
          </h3>

          {/* Description Preview */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Owner details */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={item.ownerAvatar}
                alt={item.ownerName}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
              />
              <span className="text-xs font-semibold text-slate-700 truncate max-w-[110px]">
                {item.ownerName}
              </span>
            </div>
            <RatingStars rating={item.ownerRating || item.rating} count={item.reviewCount} size="xs" />
          </div>
        </div>

        {/* Pricing & Borrow Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-extrabold text-slate-900">
                ₹{item.pricePerHour}
              </span>
              <span className="text-[11px] text-slate-500">/hr</span>
              <span className="text-[10px] text-slate-400 ml-1">
                (₹{item.pricePerDay}/day)
              </span>
            </div>
            {item.securityDeposit && (
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Shield size={10} className="text-sky-600" />
                Deposit: ₹{item.securityDeposit}
              </div>
            )}
          </div>

          <button
            onClick={handleQuickBorrow}
            disabled={!item.isAvailable}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
              item.isAvailable
                ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs shadow-brand-500/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{item.isAvailable ? 'Borrow' : 'Booked'}</span>
            {item.isAvailable && <ArrowRight size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
}
