import React from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating = 5, count, size = 'sm', interactive = false, onChange }) {
  const iconSize = size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'md' ? 18 : 24;

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const half = rating >= star - 0.5 && rating < star;
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(star)}
              className={`transition-transform ${interactive ? 'hover:scale-125 cursor-pointer p-0.5' : 'cursor-default'}`}
            >
              <Star
                size={iconSize}
                className={filled ? 'fill-amber-400 text-amber-400' : half ? 'fill-amber-300 text-amber-400' : 'text-slate-300'}
              />
            </button>
          );
        })}
      </div>
      {rating > 0 && (
        <span className={`font-semibold text-slate-700 ${size === 'xs' ? 'text-[11px]' : size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className={`text-slate-400 ${size === 'xs' ? 'text-[10px]' : 'text-xs'}`}>
          ({count})
        </span>
      )}
    </div>
  );
}
