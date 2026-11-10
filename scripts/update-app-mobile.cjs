const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add mobile viewport and scroll restoration hook
const hookTarget = '  }, [user, role, setCurrentPage]);';
const hookAddition = `  }, [user, role, setCurrentPage]);

  // Automatic Mobile Viewport & Scroll Restoration on Page/Route/Screen Change
  useEffect(() => {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentPage, selectedCollegeId, isLoginFlow]);`;

if (!code.includes('Automatic Mobile Viewport & Scroll Restoration')) {
  code = code.replace(hookTarget, hookAddition);
}

// 2. Replace min-h-screen with min-h-[100dvh]
code = code.replace(
  '<div className="min-h-screen flex flex-col justify-between bg-slate-50',
  '<div className="min-h-[100dvh] flex flex-col justify-between bg-slate-50'
);
code = code.replace(
  '<main className={`flex-1 min-h-screen flex justify-center p-4',
  '<main className={`flex-1 min-h-[100dvh] flex justify-center p-3 sm:p-4'
);

// 3. Add pb-24 md:pb-0 to main in authenticated layout so BottomNav doesn't cover content
code = code.replace(
  '<main className="flex-1 min-h-[calc(100vh-56px)] transition-all duration-300 flex flex-col">',
  '<main className="flex-1 min-h-[calc(100dvh-56px)] transition-all duration-300 flex flex-col pb-24 md:pb-0">'
);

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('src/App.jsx updated successfully!');
