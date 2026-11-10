const fs = require('fs');

let code = fs.readFileSync('src/components/college/CollegeSelectScreen.jsx', 'utf8');

// 1. Blur active element on continue
code = code.replace(
  `  const handleContinue = () => {
    if (!selectedInstitution) return;
    onConfirmInstitution(selectedInstitution);
  };`,
  `  const handleContinue = () => {
    if (!selectedInstitution) return;
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    onConfirmInstitution(selectedInstitution);
  };`
);

// 2. Input font size: use text-base (16px) on mobile to prevent iOS/mobile auto-zoom
code = code.replace(
  'text-xs sm:text-sm font-semibold text-slate-900 dark:text-white',
  'text-base sm:text-sm font-semibold text-slate-900 dark:text-white'
);

// 3. Clean up container scale transforms
code = code.replace(
  "isAdjusted ? 'mb-2 scale-90' : 'mb-3.5 scale-100 sm:scale-110'",
  "isAdjusted ? 'mb-2' : 'mb-3.5'"
);

// 4. Ensure continue button is comfortable touch target (min 48px height)
code = code.replace(
  'w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black',
  'w-full min-h-[48px] py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-black'
);

fs.writeFileSync('src/components/college/CollegeSelectScreen.jsx', code, 'utf8');
console.log('CollegeSelectScreen.jsx updated successfully!');
