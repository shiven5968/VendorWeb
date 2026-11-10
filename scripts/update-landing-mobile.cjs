const fs = require('fs');

let code = fs.readFileSync('src/pages/LandingPage.jsx', 'utf8');

code = code.replace(
  'font-saviour text-lg sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase whitespace-nowrap',
  'font-saviour text-xs min-[360px]:text-sm sm:text-lg md:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase whitespace-nowrap text-center'
);

code = code.replace(
  'inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50',
  'inline-flex flex-wrap items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 max-w-full'
);

fs.writeFileSync('src/pages/LandingPage.jsx', code, 'utf8');
console.log('LandingPage.jsx updated successfully!');
