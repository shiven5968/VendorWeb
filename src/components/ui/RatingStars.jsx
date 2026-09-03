import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';

export const RatingStars = ({ value, rating, onChange, readonly = false, size = 'md', className = '' }) => {
  const numericValue = value !== undefined ? value : (rating !== undefined ? rating : 0);
  const isReadonly = readonly || !onChange;
  const [hovered, setHovered] = useState(0);
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';

  return (
    <div className={clsx('flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= (isReadonly ? numericValue : (hovered || numericValue));
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={clsx(
              'transition-colors',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
            )}
            aria-label={`Rate ${star} out of 5`}
          >
            <Star
              className={clsx(
                sizeClass,
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-slate-300 dark:text-slate-600'
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
