import React from 'react';
import { Linkedin, Sparkles, ExternalLink, GraduationCap, Users } from 'lucide-react';
import { FOUNDERS } from '../config/founders';

export const AboutUsSection = () => {
  return (
    <div className="space-y-6">
      
      {/* Section Header */}
      <div className="text-center sm:text-left space-y-1">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider mb-1">
          <Users className="w-3.5 h-3.5" />
          <span>ABOUT US</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          The team behind MessMates
        </h2>
        <p className="text-xs text-slate-500 font-semibold max-w-xl">
          Crafted by ABES students to elevate hostel dining experience through real-time transparency and student feedback.
        </p>
      </div>

      {/* Two Founder Profile Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {FOUNDERS.map((founder) => (
          <div
            key={founder.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 hover:shadow-xl transition-all flex flex-col items-center text-center space-y-4 relative group"
          >
            {/* Founder Avatar with clean cropping */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shadow-lg border-2 border-emerald-500/20 group-hover:border-emerald-500 transition-all">
              <img
                src={founder.photo}
                alt={founder.name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Founder Info Hierarchy */}
            <div className="space-y-1 w-full">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {founder.name}
              </h3>
              
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                  {founder.role}
                </span>
              </div>

              <div className="pt-1 flex items-center justify-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                <span>{founder.year} • {founder.branch}</span>
              </div>
            </div>

            {/* View LinkedIn Action Button */}
            <div className="w-full pt-2">
              <a
                href={founder.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-sm transition-all group-hover:bg-[#0A66C2] dark:group-hover:bg-[#0A66C2]"
              >
                <Linkedin className="w-4 h-4 fill-current" />
                <span>VIEW LINKEDIN</span>
                <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
