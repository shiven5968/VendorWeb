import React from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, Shield, Award, Users, LogOut } from 'lucide-react';

export const RoleSwitcherBar = () => {
  const { currentUser, loginAsUser, usersList, logout } = useApp();

  if (!currentUser) return null;

  return (
    <div className="bg-slate-900 text-white text-xs py-1.5 px-4 border-b border-emerald-500/20 sticky top-0 z-50 shadow-md backdrop-blur-md bg-slate-900/95">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        
        {/* Active Authenticated User Badge */}
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            ● Active User:
          </span>
          <span className="font-bold text-white text-xs">
            {currentUser.name} ({currentUser.role.toUpperCase()} • {currentUser.hostelBlock})
          </span>
        </div>

        {/* Quick Pilot Switcher */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          <span className="text-[10px] text-slate-400 font-semibold mr-1 hidden sm:inline">Switch Pilot Account:</span>
          {usersList.slice(0, 5).map(u => {
            const isCurrent = currentUser.id === u.id;
            return (
              <button
                key={u.id}
                onClick={() => loginAsUser(u.id)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  isCurrent
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {u.name.split(' ')[0]} ({u.role.substring(0, 4)})
              </button>
            );
          })}

          <button
            onClick={logout}
            title="Logout"
            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 ml-1 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
