import React, { useState } from 'react';
import { 
  Linkedin, 
  Sparkles, 
  ExternalLink, 
  GraduationCap, 
  Users, 
  ZoomIn, 
  X, 
  ShieldCheck, 
  HeartHandshake, 
  Flame, 
  Award,
  Maximize2
} from 'lucide-react';
import { FOUNDERS } from '../config/founders';

export const AboutUsSection = () => {
  const [activePhotoModal, setActivePhotoModal] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ── 1. SECTION HEADER & VISION ─────────────────────────────────────── */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>MEET THE FOUNDERS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          The Minds Behind <span className="text-emerald-600 dark:text-emerald-400">MessMates</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
          Built from the ground up by ABES Engineering College hostellers to revolutionize the campus dining ecosystem through transparent meal nutrition, real-time ratings, and community accountability.
        </p>
      </div>

      {/* ── 2. TWO CO-FOUNDER PROFILE CARDS (4K CRISP) ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {FOUNDERS.map((founder) => (
          <div
            key={founder.id}
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 hover:shadow-xl transition-all flex flex-col justify-between space-y-5 relative group"
          >
            {/* Top Row: Photo & Role Badge */}
            <div className="flex flex-col items-center text-center space-y-4">
              
              {/* 4K Portrait with interactive zoom affordance */}
              <div 
                onClick={() => {
                  setActivePhotoModal(founder);
                  setIsZoomed(false);
                }}
                className="relative w-36 h-44 sm:w-40 sm:h-48 rounded-3xl overflow-hidden shadow-lg border-2 border-emerald-500/30 group-hover:border-emerald-500 transition-all duration-300 bg-slate-100 dark:bg-slate-800 cursor-pointer"
                title="Click to view 4K Ultra-Crisp Portrait"
              >
                <img
                  src={founder.photo}
                  alt={founder.name}
                  loading="eager"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  style={{ imageRendering: 'auto' }}
                />

                {/* 4K Ultra-Crisp Verified Pill */}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-slate-950/75 backdrop-blur-md text-[9px] font-black text-emerald-400 flex items-center space-x-1 border border-emerald-500/30 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                  <span>4K</span>
                </div>

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="px-3 py-1 rounded-xl bg-slate-900/90 text-white text-[10px] font-bold flex items-center space-x-1.5 shadow-md">
                    <Maximize2 className="w-3 h-3 text-emerald-400" />
                    <span>View 4K</span>
                  </div>
                </div>
              </div>

              {/* Name & Academic Credentials */}
              <div className="space-y-1.5 w-full">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {founder.name}
                </h3>
                
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-[11px] font-black uppercase tracking-wider border border-emerald-500/20">
                    {founder.role}
                  </span>
                </div>

                <div className="pt-1 flex items-center justify-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400 font-bold">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{founder.year} • {founder.branch} • {founder.college}</span>
                </div>
              </div>

              {/* Engaging Founder Bio */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium px-1">
                {founder.bio}
              </p>

              {/* Founder Highlight Badges */}
              {founder.highlights && (
                <div className="flex flex-wrap gap-1.5 justify-center pt-1 w-full">
                  {founder.highlights.map((highlight, idx) => (
                    <span 
                      key={idx}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              )}

            </div>

            {/* Bottom Row: Official LinkedIn Connect */}
            <div className="w-full pt-2">
              <a
                href={founder.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-[#0A66C2] dark:bg-slate-800 dark:hover:bg-[#0A66C2] text-white font-black text-xs flex items-center justify-center space-x-2 shadow-sm transition-all duration-200 group-hover:shadow-md cursor-pointer"
              >
                <Linkedin className="w-4 h-4 fill-current" />
                <span>CONNECT ON LINKEDIN</span>
                <ExternalLink className="w-3 h-3 opacity-70 ml-0.5" />
              </a>
            </div>

          </div>
        ))}
      </div>

      {/* ── 3. STORY BANNER: "BUILT BY HOSTELLERS, FOR HOSTELLERS" ──────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-xl space-y-4 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-200" />
            <span>OUR MISSION & STORY</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Built by Hostellers, for Hostellers
          </h3>
          <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed font-medium max-w-2xl">
            Every semester, thousands of college students walk into dining halls with zero visibility into meal schedules, nutritional macros, or preparation hygiene. MessMates bridges this gap by turning student feedback into actionable dining improvements and giving every student full ownership of their health journey.
          </p>
        </div>

        {/* Impact Highlights */}
        <div className="relative z-10 grid grid-cols-3 gap-3 pt-2 border-t border-white/20">
          <div className="text-center sm:text-left">
            <div className="text-lg sm:text-2xl font-black text-white">5,000+</div>
            <div className="text-[10px] sm:text-xs text-emerald-100 font-semibold">Campus Students</div>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-lg sm:text-2xl font-black text-white">100%</div>
            <div className="text-[10px] sm:text-xs text-emerald-100 font-semibold">Macro Transparency</div>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-lg sm:text-2xl font-black text-white">24/7</div>
            <div className="text-[10px] sm:text-xs text-emerald-100 font-semibold">Real-Time Sync</div>
          </div>
        </div>
      </div>

      {/* ── 4. 4K ULTRA-HIGH RESOLUTION FOUNDER PHOTO MODAL ─────────────────── */}
      {activePhotoModal && (
        <div 
          onClick={() => setActivePhotoModal(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  {activePhotoModal.name}
                </h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  {activePhotoModal.role} • 4K Official Portrait
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4K Image Canvas with Zoom Toggle */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-center min-h-[340px]">
              <img
                src={activePhotoModal.photo}
                alt={activePhotoModal.name}
                className={`max-h-[500px] w-auto object-contain transition-transform duration-300 select-none ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
                title={isZoomed ? 'Click to zoom out' : 'Click to zoom in (4K Clarity)'}
              />

              {/* Zoom pill button */}
              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold flex items-center space-x-1.5 border border-white/20 shadow-md cursor-pointer hover:bg-slate-800"
              >
                <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isZoomed ? 'Zoom 1x' : 'Zoom 4K'}</span>
              </button>
            </div>

            {/* Modal Footer info */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-medium">
                {activePhotoModal.college} • {activePhotoModal.branch}
              </span>
              <a
                href={activePhotoModal.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-[#0A66C2] dark:bg-slate-800 text-white font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Linkedin className="w-3.5 h-3.5 fill-current" />
                <span>Open LinkedIn</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AboutUsSection;
