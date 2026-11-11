import React from 'react';
import fullLight from '../assets/branding/messmates-logo-light.svg';
import fullDark from '../assets/branding/messmates-logo-dark.svg';
import iconImg from '../assets/branding/messmates-icon.svg';
import iconEmerald from '../assets/branding/messmates-icon-emerald.svg';
import wmGreen from '../assets/branding/messmates-wordmark-green.svg';
import wmWhite from '../assets/branding/messmates-wordmark-white.svg';

/**
 * MessMates Authentic Official Logo Component
 * - Pure mathematical SVG vectors traced from the original MessMates mark & wordmark (#013e1d)
 * - Infinite sharpness across 1x-4K screens, retina displays, and pinch/browser zoom
 * - Fluid max-w-full constraint prevents horizontal overflow on compact mobile screens (320px+)
 */
export const MessMatesLogo = ({
  variant = 'full',
  size = 'md',
  className = '',
  imgClassName = '',
  dark = false,
  light = false,
  showTagline = false
}) => {
  // Intrinsic SVG height >= 240px lets max-h-* + w-auto h-auto scale proportionally even when max-w-full clamps on narrow screens
  const sizeMap = {
    xs: 'max-h-5',
    sm: 'max-h-6 min-[360px]:max-h-7',
    md: 'max-h-8 sm:max-h-9',
    lg: 'max-h-10 min-[360px]:max-h-11 sm:max-h-12',
    xl: 'max-h-12 min-[380px]:max-h-14 sm:max-h-16',
    '2xl': 'max-h-14 min-[380px]:max-h-16 sm:max-h-20',
    hero: 'max-h-16 min-[380px]:max-h-20 sm:max-h-24'
  };

  const currentHeight = sizeMap[size] || sizeMap.md;
  const baseImgClasses = `${currentHeight} w-auto h-auto max-w-full object-contain select-none`;

  // Variant 1: ICON ONLY
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center max-w-full ${className}`}>
        <img
          src={iconImg}
          alt="MessMates"
          className={`${baseImgClasses} ${dark ? 'hidden' : 'block dark:hidden'} ${imgClassName}`}
          loading="eager"
          decoding="async"
        />
        <img
          src={iconEmerald}
          alt="MessMates"
          className={`${baseImgClasses} ${light ? 'hidden' : dark ? 'block' : 'hidden dark:block'} ${imgClassName}`}
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // Variant 2: WORDMARK ONLY
  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex items-center max-w-full ${className}`}>
        <img
          src={wmGreen}
          alt="MESSMATES"
          className={`${baseImgClasses} ${dark ? 'hidden' : 'block dark:hidden'} ${imgClassName}`}
          loading="eager"
          decoding="async"
        />
        <img
          src={wmWhite}
          alt="MESSMATES"
          className={`${baseImgClasses} ${light ? 'hidden' : dark ? 'block' : 'hidden dark:block'} ${imgClassName}`}
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // Variant 3: FULL LOCKUP (Pure Vector Original Icon + Wordmark)
  return (
    <div className={`inline-flex flex-col items-center max-w-full ${className}`}>
      <div className="inline-flex items-center justify-center max-w-full">
        <img
          src={fullLight}
          alt="MessMates"
          className={`${baseImgClasses} ${dark ? 'hidden' : 'block dark:hidden'} ${imgClassName}`}
          loading="eager"
          decoding="async"
        />
        <img
          src={fullDark}
          alt="MessMates"
          className={`${baseImgClasses} ${light ? 'hidden' : dark ? 'block' : 'hidden dark:block'} ${imgClassName}`}
          loading="eager"
          decoding="async"
        />
      </div>
      {showTagline && (
        <span className="font-saviour text-[10px] sm:text-xs font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase mt-1.5 whitespace-nowrap">
          Know Your Meal Before You Eat It
        </span>
      )}
    </div>
  );
};

export default MessMatesLogo;
