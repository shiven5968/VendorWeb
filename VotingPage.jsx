import React from 'react';
import { useApp } from '../context/AppContext';
import { Vote, Check, Sparkles, AlertTriangle } from 'lucide-react';

export const VotingPage = () => {
  const { poll, voteDish } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="text-center space-y-3">
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Student Democracy Platform</span>
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Dish Replacement Voting Center</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          When a hostel dish drops below 2.5 stars, MessMate automatically opens a 24-hour voting poll. Cast your vote below to decide the replacement menu item!
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-2xl border border-amber-500/30">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Low Rating Trigger</span>
            <h2 className="text-2xl font-extrabold text-white mt-1">Replacing: "{poll.dishToReplace}" ({poll.currentRating} ⭐)</h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">{poll.endsIn}</span>
            <span className="text-sm font-bold text-amber-400">{poll.totalVotes} Student Votes Cast</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Select 1 Replacement Dish</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {poll.options.map(opt => {
              const isVoted = poll.userVoted === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => voteDish(opt.id)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-4 ${
                    isVoted
                      ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500'
                      : 'bg-slate-800 border-slate-700 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-bold text-white">{opt.name}</h4>
                    {isVoted && (
                      <span className="p-1 rounded-full bg-emerald-500 text-white">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    <p>Protein: <strong className="text-emerald-400">{opt.protein}</strong></p>
                    <p>Energy: <strong>{opt.calories}</strong></p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">{opt.votes} votes</span>
                      <span className="text-emerald-400">{opt.percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${opt.percent}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {poll.userVoted && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center">
            ✔ Your vote has been recorded! Earned +30 Healthy Reward Points.
          </div>
        )}

      </div>

    </div>
  );
};
