import React from 'react';
import fullLight from '../assets/branding/messmates-full-logo-light.png';
import fullDark from '../assets/branding/messmates-full-logo-dark.png';
import iconImg from '../assets/branding/messmates-logo-icon.png';
import wmGreen from '../assets/branding/messmates-wordmark-green.png';
import wmWhite from '../assets/branding/messmates-wordmark-white.png';

/**
 * MessMates Authentic Official Logo Component
 * - Exact authentic icon & wordmark font as specified by founders
 * - Crisp 4K resolution rendering (#059669 emerald green & crisp dark mode)
 *
 * @param {'full'|'icon'|'wordmark'} variant - Display mode ('full', 'icon', 'wordmark')
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|'hero'} size - Preset sizes
 * @param {string} className - Container custom styling
 * @param {string} imgClassName - Custom image styling
 * @param {boolean} dark - Force dark wordmark (white text)
 * @param {boolean} light - Force light wordmark (green text)
 * @param {boolean} showTagline - Optional slogan under the wordmark
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
  // Proportional sizing calibrated for standard UI components & hero headers
  const sizeMap = {
    xs: 'h-5 w-auto',
    sm: 'h-7 w-auto',
    md: 'h-8 sm:h-9 w-auto',
    lg: 'h-11 sm:h-12 w-auto',
    xl: 'h-14 sm:h-16 w-auto',
    '2xl': 'h-16 sm:h-20 w-auto',
    hero: 'h-20 sm:h-24 w-auto'
  };

  const currentHeight = sizeMap[size] || sizeMap.md;

  // Variant 1: ICON ONLY
  if (variant === 'icon') {
    return (
      <img
        src={iconImg}
        alt="MessMates"
        className={`${currentHeight} object-contain select-none ${imgClassName} ${className}`}
        loading="eager"
        style={{ imageRendering: '-webkit-optimize-contrast' }}
      />
    );
  }

  // Variant 2: WORDMARK ONLY
  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src={wmGreen}
          alt="MESSMATES"
          className={`${currentHeight} object-contain select-none ${dark ? 'hidden' : 'block dark:hidden'} ${imgClassName}`}
          loading="eager"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
        />
        <img
          src={wmWhite}
          alt="MESSMATES"
          className={`${currentHeight} object-contain select-none ${light ? 'hidden' : 'hidden dark:block'} ${imgClassName}`}
          loading="eager"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
        />
      </div>
    );
  }

  // Variant 3: FULL LOCKUP (Exact Authentic Icon + Exact Brand Wordmark)
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div className="inline-flex items-center">
        <img
          src={fullLight}
          alt="MessMates"
          className={`${currentHeight} object-contain select-none ${dark ? 'hidden' : 'block dark:hidden'} ${imgClassName}`}
          loading="eager"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
        />
        <img
          src={fullDark}
          alt="MessMates"
          className={`${currentHeight} object-contain select-none ${light ? 'hidden' : 'hidden dark:block'} ${imgClassName}`}
          loading="eager"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
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
