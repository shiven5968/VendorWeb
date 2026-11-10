const fs = require('fs');

// 1. MealDetailModal.jsx
let mdm = fs.readFileSync('src/components/MealDetailModal.jsx', 'utf8');
mdm = mdm.replace(
  'className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white outline-none focus:border-emerald-500"',
  'className="w-full px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-base sm:text-xs text-white outline-none focus:border-emerald-500"'
);
mdm = mdm.replace(
  'className={`w-full py-2.5 rounded-xl font-black text-xs transition-all shadow-md',
  'className={`w-full min-h-[48px] py-3 rounded-xl font-black text-sm transition-all shadow-md'
);
fs.writeFileSync('src/components/MealDetailModal.jsx', mdm, 'utf8');

// 2. ActivityPage.jsx (Complaints textarea)
let act = fs.readFileSync('src/pages/ActivityPage.jsx', 'utf8');
act = act.replace(
  'text-slate-900 dark:text-white text-xs placeholder:text-slate-400',
  'text-slate-900 dark:text-white text-base sm:text-xs placeholder:text-slate-400'
);
act = act.replace(
  'className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"',
  'className="min-h-[44px] px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-black transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"'
);
fs.writeFileSync('src/pages/ActivityPage.jsx', act, 'utf8');

// 3. VotingPage.jsx
let vot = fs.readFileSync('src/pages/VotingPage.jsx', 'utf8');
vot = vot.replace(
  /className="w-full px-3\.5 py-2\.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-500"/g,
  'className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base sm:text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-500"'
);
fs.writeFileSync('src/pages/VotingPage.jsx', vot, 'utf8');

// 4. SearchModal.jsx
let src = fs.readFileSync('src/components/SearchModal.jsx', 'utf8');
src = src.replace(
  'className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base outline-none"',
  'className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-base outline-none"'
);
fs.writeFileSync('src/components/SearchModal.jsx', src, 'utf8');

console.log('Modals and form pages updated successfully for mobile inputs!');
