const fs = require('fs');

let code = fs.readFileSync('src/pages/LoginPage.jsx', 'utf8');

// Replace all button submit styles to have min-h-[48px] and text-sm font-black
code = code.replace(
  'className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5 mt-2 disabled:opacity-50"',
  'className="w-full min-h-[48px] py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md transition-colors flex items-center justify-center space-x-1.5 mt-2 disabled:opacity-50 cursor-pointer"'
);

code = code.replace(
  'className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5 mt-2 disabled:opacity-50 uppercase tracking-wider"',
  'className="w-full min-h-[48px] py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md transition-colors flex items-center justify-center space-x-1.5 mt-2 disabled:opacity-50 uppercase tracking-wider cursor-pointer"'
);

code = code.replace(
  'className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50 uppercase tracking-wider"',
  'className="w-full min-h-[48px] py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50 uppercase tracking-wider cursor-pointer"'
);

code = code.replace(
  'className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"',
  'className="w-full min-h-[48px] py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"'
);

fs.writeFileSync('src/pages/LoginPage.jsx', code, 'utf8');
console.log('LoginPage.jsx submit buttons updated to min-h-[48px] and text-sm font-black!');
