import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Utensils, 
  Dumbbell, 
  Vote, 
  Gift, 
  BarChart3, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  Star, 
  Users, 
  Award,
  Clock,
  HeartHandshake
} from 'lucide-react';

export const LandingPage = () => {
  const { loginAsRole, setCurrentPage } = useApp();

  return (
    <div className="space-y-24 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 lg:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-semibold shadow-sm">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>Next-Gen Hostel Dining & Nutrition Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Mess<span className="text-brand-600 dark:text-brand-400">Mate</span>
            </h1>

            <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">
              Know Your Meal Before You Eat It
            </p>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              A smart hostel meal management platform that improves food quality using student feedback, nutrition transparency, and data-driven decision making.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => setCurrentPage('login')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base shadow-xl shadow-brand-500/25 hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center space-x-2 group"
              >
                <span>Enter Pilot Portal</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('features-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-base border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
              >
                Learn More
              </button>
            </div>

            {/* Quick stats badges */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">100%</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Nutrition Transparency</p>
              </div>
              <div>
                <span className="text-2xl font-black text-brand-600 dark:text-brand-400">4.8 ⭐</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Student Quality Score</p>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">-14%</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Food Waste Reduced</p>
              </div>
            </div>

          </div>

          {/* Hero Right Visual Interactive Preview Card */}
          <div className="lg:col-span-5 relative">
            <div className="glass-panel p-6 rounded-3xl shadow-2xl border border-brand-500/20 relative space-y-5 animate-float">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Live Today's Meal</span>
                </div>
                <span className="text-xs text-slate-400 font-semibold">Mess Hall 1</span>
              </div>

              {/* Sample Dish Card */}
              <div className="relative rounded-2xl overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600" 
                  alt="Paneer Paratha" 
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500 font-bold uppercase">Breakfast</span>
                      <h3 className="text-lg font-bold">Paneer Paratha & Curd</h3>
                    </div>
                    <span className="text-xs font-extrabold bg-amber-400 text-slate-900 px-2 py-1 rounded-lg">4.6 ⭐</span>
                  </div>
                </div>
              </div>

              {/* Gym Mode Live Widget Preview */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 border border-emerald-500/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center space-x-1">
                    <Dumbbell className="w-3.5 h-3.5" />
                    <span>Gym Mode Active (Parth's Goal)</span>
                  </span>
                  <span className="text-slate-300 font-mono">88g / 120g</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-brand-400 w-[73%] rounded-full"></div>
                </div>
                <p className="text-[11px] text-slate-300">
                  ⚡ <strong>Paneer Paratha</strong> provides <strong>18g protein</strong> to hit your target!
                </p>
              </div>

              {/* Quick Role Select Buttons */}
              <div className="pt-2 grid grid-cols-3 gap-2">
                <button
                  onClick={() => loginAsRole('student')}
                  className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center transition-all"
                >
                  Student Dashboard →
                </button>
                <button
                  onClick={() => loginAsRole('committee')}
                  className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-bold text-center transition-all"
                >
                  Mess Committee →
                </button>
                <button
                  onClick={() => loginAsRole('warden')}
                  className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold text-center transition-all"
                >
                  Warden Portal →
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Platform Capabilities</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Everything Hostel Dining Needs in One Clean Product
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Engineered specifically for student welfare, kitchen efficiency, and chief warden oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gym Mode ⭐ Premium</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Set your daily protein goals (e.g. 120g). MessMate tracks your macros and recommends exactly which hostel dishes to eat to smash your fitness targets.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Vote className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Low-Rating Dish Voting</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              When a dish gets poor ratings, the system automatically launches an instant 24-hour student poll to vote for replacement menu items.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Healthy Reward System</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Earn points for daily meal ratings, voting, and completing protein goals. Redeem points exclusively for healthy snacks like fruit bowls & protein shakes.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Committee Menu Studio</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload, edit, and delete daily and weekly menus. Add ingredient lists, allergen warnings, and high-resolution food images seamlessly.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Warden Executive Portal</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Chief Warden gets full visibility into Mess Quality Index, food waste analytics, complaint resolution, and 1-click weekly menu approvals.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Role-Based Access</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Secure authentication architecture designed with custom roles for Students, Mess Committee members, and Chief Warden administrative staff.
            </p>
          </div>

        </div>
      </section>

      {/* WHY MESSMATE */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl max-w-7xl mx-auto border border-emerald-500/20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="space-y-4 p-6 rounded-2xl bg-slate-800/60 border border-slate-700">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">For Students</span>
            <h3 className="text-xl font-bold">Never Eat Surprise Food Again</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Full macro breakdown & allergen warnings</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Gym Mode daily protein target calculator</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Direct voting power on low-rated dishes</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4 p-6 rounded-2xl bg-slate-800/60 border border-slate-700">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">For Mess Committee</span>
            <h3 className="text-xl font-bold">Streamline Menu Operations</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>1-Click menu uploader & dish edit studio</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Automated dish replacement polling</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Monthly analytics & PDF report exporter</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4 p-6 rounded-2xl bg-slate-800/60 border border-slate-700">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">For Chief Warden</span>
            <h3 className="text-xl font-bold">Total Governance & Peace of Mind</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Real-time student satisfaction metrics</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Food waste reduction trend tracking</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Weekly menu sign-off & complaint summary</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Workflow</h2>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">How MessMate Operates Daily</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            { step: '01', title: 'Menu Uploaded', desc: 'Mess Committee uploads daily dishes with calories, protein & allergen info.' },
            { step: '02', title: 'Students Track & Rate', desc: 'Students check Gym Mode protein goals and rate meals from 1 to 5 stars.' },
            { step: '03', title: 'Voting Poll Launched', desc: 'Dishes scoring below 2.5 stars trigger a 24-hour replacement vote.' },
            { step: '04', title: 'Warden Governance', desc: 'Hostel Administration approves the updated menu based on real-time analytics.' },
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-3xl font-black text-brand-600 dark:text-brand-400">{item.step}</span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Hostel Feedback</h2>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">Loved by Students & Campus Authorities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "Gym Mode is a lifesaver! I used to struggle hitting 120g protein in hostel. Now MessMate tells me exactly when Paneer or Soya is served."
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" alt="Student" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">Hostel Resident</h5>
                <p className="text-[10px] text-slate-400">3rd Year Student • DNB Block</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "Dishes that students disliked used to cause complaints. Now we launch a replacement vote and student participation is at an all-time high!"
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=150" alt="Mess Admin" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">Mess Committee Head</h5>
                <p className="text-[10px] text-slate-400">Student Council Representative</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "Food waste in our hostel dropped by 14% within the first month. The analytics dashboard gives me clear evidence for kitchen audits."
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" alt="Warden" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">Chief Warden</h5>
                <p className="text-[10px] text-slate-400">Hostel Administration</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT & CTA */}
      <section id="contact-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-600 via-brand-700 to-slate-900 text-white shadow-2xl space-y-6 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold">Ready for Campus Deployment</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Deploy MessMate to Your University</h2>
            <p className="text-slate-200 text-sm">
              Empower your hostel dining hall with student feedback, gym macros, and warden analytics today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={() => loginAsRole('student')}
              className="px-8 py-3.5 rounded-xl bg-white text-brand-700 font-bold hover:bg-slate-100 transition-colors shadow-lg"
            >
              Test Student Demo
            </button>
            <button
              onClick={() => loginAsRole('warden')}
              className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold border border-slate-700 transition-colors"
            >
              Warden Portal
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
