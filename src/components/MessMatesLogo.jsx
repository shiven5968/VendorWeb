import React from 'react';
import fullLight from '../assets/branding/messmates-full-logo-light.png';
import fullDark from '../assets/branding/messmates-full-logo-dark.png';
import iconImg from '../assets/branding/messmates-logo-icon.png';
import wmGreen from '../assets/branding/messmates-wordmark-green.png';
import wmWhite from '../assets/branding/messmates-wordmark-white.png';

/**
 * MessMates Official 4K Ultra-Crisp Vector Logo Component
 * - 100% Crisp Vector SVG rendering (zero pixelation, zero blur at 4K/Retina)
 * - Authentic Cloche & Mates Icon + Clean, Bold Brand Typography
 * - Synchronized with website emerald palette (#059669 / #10b981)
 *
 * @param {'full'|'icon'|'wordmark'} variant - Display mode ('full', 'icon', 'wordmark')
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|'hero'} size - Preset sizes
 * @param {string} className - Container custom styling
 * @param {string} imgClassName - Custom SVG/image styling
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
  // Proportional sizing calibrated for standard UI components & high-res hero sections
  const sizeMap = {
    xs: 'h-5 w-auto',
    sm: 'h-7 w-auto',
    md: 'h-8 sm:h-9 w-auto',
    lg: 'h-11 sm:h-12 w-auto',
    xl: 'h-14 sm:h-16 w-auto',
    '2xl': 'h-16 sm:h-20 w-auto',
    hero: 'h-20 sm:h-28 w-auto'
  };

  const currentHeight = sizeMap[size] || sizeMap.md;

  // Vector Cloche Icon Path Data (Infinite Scalability)
  const renderClochePaths = () => (
    <>
      {/* Top Cloche Dome */}
      <path d="M 54.5 12 C 54.5 9.5 52.5 7.5 50 7.5 C 47.5 7.5 45.5 9.5 45.5 12 C 45.5 13.5 46.2 14.8 47.4 15.6 C 33.2 17.5 22.2 27.5 20.3 40.5 L 79.7 40.5 C 77.8 27.5 66.8 17.5 52.6 15.6 C 53.8 14.8 54.5 13.5 54.5 12 Z" />
      <path d="M 18 43.5 L 82 43.5 C 83.5 43.5 84.5 45 84 46.5 L 81 50 C 80.5 50.8 79.5 51.5 78.5 51.5 L 21.5 51.5 C 20.5 51.5 19.5 50.8 19 50 L 16 46.5 C 15.5 45 16.5 43.5 18 43.5 Z" />
      {/* Left Wing with Fork Cutout */}
      <path d="M 5 28 L 5 95 C 5 97.8 7.2 100 10 100 L 46 100 C 47.5 100 48.8 99 49.5 97.5 C 51.5 93 51 82 45 68 C 39 54 44 42 47 38 L 47 36 C 45 34 32 28 5 28 Z M 27.5 54 C 28.5 54 29 55 29 56 L 29 70 C 29 73 27 75 25 76 L 25 90 C 25 91 24 92 23 92 C 22 92 21 91 21 90 L 21 76 C 19 75 17 73 17 70 L 17 56 C 17 55 17.5 54 18.5 54 C 19.5 54 20 55 20 56 L 20 66 L 21.5 66 L 21.5 56 C 21.5 55 22 54 23 54 C 24 54 24.5 55 24.5 56 L 24.5 66 L 26 66 L 26 56 C 26 55 26.5 54 27.5 54 Z" />
      {/* Right Wing with Spoon Cutout */}
      <path d="M 95 28 L 95 95 C 95 97.8 92.8 100 90 100 L 54 100 C 52.5 100 51.2 99 50.5 97.5 C 48.5 93 49 82 55 68 C 61 54 56 42 53 38 L 53 36 C 55 34 68 28 95 28 Z M 73 54 C 77.5 54 81 59 81 65 C 81 70 78 74 75 75.5 L 75 90 C 75 91 74 92 73 92 C 72 92 71 91 71 90 L 71 75.5 C 68 74 65 70 65 65 C 65 59 68.5 54 73 54 Z" />
    </>
  );

  // Variant 1: ICON ONLY
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentHeight} select-none ${imgClassName} ${className}`}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="MessMates"
      >
        <g className="text-emerald-600 dark:text-emerald-400">
          {renderClochePaths()}
        </g>
      </svg>
    );
  }

  // Variant 2: WORDMARK ONLY
  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <svg
          viewBox="0 0 430 100"
          className={`${currentHeight} select-none ${imgClassName}`}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="MESSMATES"
        >
          <text
            x="5"
            y="78"
            fontFamily="'Poppins', 'Inter', 'Montserrat', -apple-system, sans-serif"
            fontWeight="900"
            fontSize="62"
            letterSpacing="1"
            className={dark ? 'fill-white' : light ? 'fill-emerald-600' : 'fill-emerald-600 dark:fill-white'}
          >
            MESSMATES
          </text>
        </svg>
      </div>
    );
  }

  // Variant 3: FULL HORIZONTAL 4K VECTOR LOCKUP (Icon + Bold Wordmark)
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div className="inline-flex items-center">
        <svg
          viewBox="0 0 540 100"
          className={`${currentHeight} select-none ${imgClassName}`}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="MessMates"
          style={{ imageRendering: 'crisp-edges' }}
        >
          {/* 4K Vector Icon in Theme Emerald */}
          <g className={dark ? 'text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'} fill="currentColor">
            {renderClochePaths()}
          </g>

          {/* 4K Vector Wordmark with Zero Distortion / Noise */}
          <text
            x="114"
            y="78"
            fontFamily="'Poppins', 'Inter', 'Montserrat', -apple-system, sans-serif"
            fontWeight="900"
            fontSize="62"
            letterSpacing="1"
            className={dark ? 'fill-white' : light ? 'fill-emerald-600' : 'fill-emerald-600 dark:fill-white'}
          >
            MESSMATES
          </text>
        </svg>
      </div>

      {showTagline && (
        <span className="font-saviour text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase mt-1.5 whitespace-nowrap">
          Know Your Meal Before You Eat It
        </span>
      )}
    </div>
  );
};

export default MessMatesLogo;
