const fs = require('fs');

let code = fs.readFileSync('src/pages/LoginPage.jsx', 'utf8');

// Replace input text-xs with text-base (16px) across form inputs
code = code.replace(
  /className="w-full pl-10 pr-3\.5 py-2\.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500\/20"/g,
  'className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"'
);

// Registration input classes
code = code.replace(
  /className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500\/20"/g,
  'className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"'
);

// OTP and reset input classes
code = code.replace(
  'className="w-full text-center py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-lg font-black tracking-widest outline-none focus:ring-2 focus:ring-emerald-500/20"',
  'className="w-full text-center py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xl font-black tracking-widest outline-none focus:ring-2 focus:ring-emerald-500/20"'
);

// Submit Buttons: ensure min-h-[48px]
code = code.replace(
  'className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black',
  'className="w-full min-h-[48px] py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm sm:text-base font-black'
);

fs.writeFileSync('src/pages/LoginPage.jsx', code, 'utf8');
console.log('LoginPage.jsx updated successfully!');
