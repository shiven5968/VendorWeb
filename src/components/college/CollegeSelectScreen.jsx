import React, { useState, useMemo } from 'react';
import { Search, X, Building2, MapPin, CheckCircle2, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { MessMatesLogo } from '../MessMatesLogo';
import { INSTITUTIONS, searchInstitutions, isInstitutionActive } from '../../config/institutions';

export const CollegeSelectScreen = ({
  initialSelectedId = null,
  onConfirmInstitution
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(initialSelectedId || 'abes_ec');

  // Filter institutions using query
  const filteredInstitutions = useMemo(() => {
    return searchInstitutions(searchQuery);
  }, [searchQuery]);

  const selectedInstitution = useMemo(() => {
    return INSTITUTIONS.find(i => i.id === selectedInstitutionId) || null;
  }, [selectedInstitutionId]);

  const handleSelect = (inst) => {
    setSelectedInstitutionId(inst.id);
  };

  const handleContinue = () => {
    if (!selectedInstitution) return;
    onConfirmInstitution(selectedInstitution);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-10 animate-in fade-in duration-300">
      
      {/* 1. Header & Official Branding */}
      <div className="text-center space-y-3 mb-8">
        <div className="flex justify-center mb-3">
          <MessMatesLogo variant="full" size="md" />
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Hey there!
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
            Select your college or university to continue.
          </p>
        </div>
      </div>

      {/* 2. Searchable Input */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your college or university..."
          autoFocus
          className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 shadow-sm transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3. Institution Results List */}
      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
        {filteredInstitutions.length > 0 ? (
          filteredInstitutions.map((inst) => {
            const isSelected = selectedInstitutionId === inst.id;
            const isActive = isInstitutionActive(inst);

            return (
              <button
                key={inst.id}
                type="button"
                onClick={() => handleSelect(inst)}
                className={`w-full p-4 rounded-2xl text-left transition-all flex items-start space-x-3.5 border-2 ${
                  isSelected
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 dark:border-emerald-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Institution Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                </div>

                {/* Institution Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {inst.name}
                    </h3>

                    {/* Status Pill */}
                    {isActive ? (
                      <span className="shrink-0 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Active Campus</span>
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Waitlist Open</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
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
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No universities found
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              We couldn't find any college matching "{searchQuery}". You can search by college name, abbreviation, or city.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSearchQuery('ABES')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Reset search to active campuses
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Selection Confirmation & Continue Action */}
      {selectedInstitution && (
        <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-slate-500 font-medium">Selected Institution:</span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1">
              <span>{selectedInstitution.name}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 group active:scale-[0.99]"
          >
            <span>Continue to {selectedInstitution.shortName || selectedInstitution.name}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* 5. Minimal Institutional Trust Note */}
      <p className="text-center text-[11px] text-slate-400 mt-6 font-medium">
        Institutional data and student dining access are strictly verified and isolated.
      </p>

    </div>
  );
};
