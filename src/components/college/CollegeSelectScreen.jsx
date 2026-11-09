import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Building2, MapPin, CheckCircle2, Clock, ArrowRight, ChevronDown } from 'lucide-react';
import { MessMatesLogo } from '../MessMatesLogo';
import { INSTITUTIONS, searchInstitutions, isInstitutionActive } from '../../config/institutions';

export const CollegeSelectScreen = ({
  initialSelectedId = null,
  onConfirmInstitution
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(initialSelectedId || null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Filter institutions using query
  const filteredInstitutions = useMemo(() => {
    return searchInstitutions(searchQuery);
  }, [searchQuery]);

  const selectedInstitution = useMemo(() => {
    return INSTITUTIONS.find(i => i.id === selectedInstitutionId) || null;
  }, [selectedInstitutionId]);

  const handleSelect = (inst) => {
    setSelectedInstitutionId(inst.id);
    setSearchQuery(inst.name);
    setIsDropdownOpen(false);
  };

  const handleContinue = () => {
    if (!selectedInstitution) return;
    onConfirmInstitution(selectedInstitution);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-4 sm:py-8 animate-in fade-in duration-300">
      
      {/* 1. Header & Official Branding */}
      <div className="text-center space-y-2 mb-6 sm:mb-8">
        <div className="flex justify-center mb-2.5">
          <MessMatesLogo variant="full" size="md" />
        </div>

        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Hey there!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Select your college or university to continue.
          </p>
        </div>
      </div>

      {/* 2. Dynamic Searchable Input & Dropdown */}
      <div ref={dropdownRef} className="relative mb-5">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsDropdownOpen(true)}
            onClick={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            placeholder="Search your college or university..."
            className="w-full pl-10 pr-12 py-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 shadow-sm transition-all cursor-pointer"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center space-x-1">
            {searchQuery && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                  setSelectedInstitutionId(null);
                  setIsDropdownOpen(true);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(prev => !prev)}
              className="p-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
              aria-label="Toggle options"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* 3. Dynamic Institution Results Dropdown — Visible only on focus/click/typing */}
        {isDropdownOpen && (
          <div className="absolute z-30 left-0 right-0 mt-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 dark:border-emerald-500/40 shadow-xl max-h-[300px] sm:max-h-[340px] overflow-y-auto space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
            {filteredInstitutions.length > 0 ? (
              filteredInstitutions.map((inst) => {
                const isSelected = selectedInstitutionId === inst.id;
                const isActive = isInstitutionActive(inst);

                return (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => handleSelect(inst)}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-start space-x-3 border cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Institution Icon */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>

                    {/* Institution Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {inst.name}
                        </h3>

                        {/* Status Pill */}
                        {isActive ? (
                          <span className="shrink-0 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="shrink-0 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold">
                            <Clock className="w-2.5 h-2.5 text-amber-500" />
                            <span>Waitlist</span>
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-1 mt-0.5 truncate">
                        <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span>{inst.city}, {inst.state}</span>
                        {inst.shortName && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-slate-500 dark:text-slate-400 font-semibold">{inst.shortName}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              /* Empty Search State */
              <div className="p-6 text-center text-slate-500 space-y-1">
                <Building2 className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No universities found
                </p>
                <p className="text-[11px] text-slate-400">
                  Try searching by college name, abbreviation, or city
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Selection Confirmation & Continue Action */}
      {selectedInstitution && (
        <div className="mt-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-slate-500 font-medium">Selected Institution:</span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1">
              <span>{selectedInstitution.name}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="w-full py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 group active:scale-[0.99] cursor-pointer"
          >
            <span>Continue to {selectedInstitution.shortName || selectedInstitution.name}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

    </div>
  );
};
