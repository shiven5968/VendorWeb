import React from 'react';
import iconImg from '../assets/branding/messmates-logo-icon.png';
import wmGreen from '../assets/branding/messmates-wordmark-green.png';
import wmWhite from '../assets/branding/messmates-wordmark-white.png';

/**
 * MessMates Official Logo Component
 * - Icon: Official cloche plate + twin dining wings (M shape) with fork and spoon
 * - Wordmark: Authentic distressed stamp typography from official branding
 *
 * @param {'full'|'icon'|'wordmark'} variant - Display mode ('full', 'icon', 'wordmark')
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} size - Preset sizes ('xs', 'sm', 'md', 'lg', 'xl')
 * @param {string} className - Container custom styling
 * @param {string} iconClassName - Custom icon sizing/styling
 * @param {string} textClassName - Custom text/wordmark styling
 * @param {boolean} dark - Force dark wordmark (white text)
 * @param {boolean} light - Force light wordmark (green text)
 * @param {boolean} showTagline - Optional slogan under the wordmark
 */
export const MessMatesLogo = ({
  variant = 'full',
  size = 'md',
  className = '',
  iconClassName = '',
  textClassName = '',
  dark = false,
  light = false,
  showTagline = false
}) => {
  const sizeMap = {
    xs: { icon: 'h-6 w-auto', text: 'h-3.5 w-auto', gap: 'space-x-1.5' },
    sm: { icon: 'h-8 w-auto', text: 'h-5 w-auto', gap: 'space-x-2' },
    md: { icon: 'h-9 w-auto', text: 'h-5.5 w-auto', gap: 'space-x-2.5' },
    lg: { icon: 'h-14 w-auto', text: 'h-8 w-auto', gap: 'space-x-3' },
    xl: { icon: 'h-20 sm:h-24 w-auto', text: 'h-10 sm:h-12 w-auto', gap: 'space-x-4' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (variant === 'icon') {
    return (
      <img
        src={iconImg}
        alt="MessMates Official Logo"
        className={`${currentSize.icon} object-contain select-none ${iconClassName} ${className}`}
        loading="eager"
      />
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src={wmGreen}
          alt="MESSMATES"
          className={`${currentSize.text} object-contain ${dark ? 'hidden' : 'block dark:hidden'} ${textClassName}`}
        />
        <img
          src={wmWhite}
          alt="MESSMATES"
          className={`${currentSize.text} object-contain ${light ? 'hidden' : 'hidden dark:block'} ${textClassName}`}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
      <img
        src={iconImg}
        alt="MessMates Official Logo"
        className={`${currentSize.icon} object-contain select-none flex-shrink-0 drop-shadow-sm ${iconClassName}`}
        loading="eager"
      />
      <div className="flex flex-col justify-center">
        <div className="inline-flex items-center">
          <img
            src={wmGreen}
            alt="MESSMATES"
            className={`${currentSize.text} object-contain ${dark ? 'hidden' : 'block dark:hidden'} ${textClassName}`}
          />
          <img
            src={wmWhite}
            alt="MESSMATES"
            className={`${currentSize.text} object-contain ${light ? 'hidden' : 'hidden dark:block'} ${textClassName}`}
          />
        </div>
        {showTagline && (
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 tracking-wider uppercase mt-0.5">
            Know Your Meal Before You Eat It
          </span>
        )}
      </div>
    </div>
  );
};

export default MessMatesLogo;
