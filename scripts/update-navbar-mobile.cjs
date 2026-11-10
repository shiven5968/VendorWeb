const fs = require('fs');

let nav = fs.readFileSync('src/components/Navbar.jsx', 'utf8');

nav = nav.replace(
  'className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"',
  'className="relative min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"'
);

nav = nav.replace(
  'className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 overflow-hidden"',
  'className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 overflow-hidden cursor-pointer shrink-0"'
);

nav = nav.replace(
  'className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"',
  'className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"'
);

fs.writeFileSync('src/components/Navbar.jsx', nav, 'utf8');
console.log('Navbar.jsx updated successfully!');
