import React from 'react';
import { useApp } from '../context/AppContext';
import { Vote, Check } from 'lucide-react';

export const VotingPage = () => {
  const { poll, voteDish } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          HELP CHOOSE THE NEXT DISH
        </h1>
        <p className="text-xs text-slate-500 font-bold mt-1">
          Replacement for: <span className="text-amber-500">{poll.dishToReplace}</span>
        </p>
      </div>

      {/* Voting Card */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-5 shadow-xl border border-slate-800">
        <div className="flex justify-between items-center text-xs text-slate-400 font-semibold border-b border-slate-800 pb-3">
          <span>{poll.endsIn}</span>
          <span className="text-emerald-400 font-bold">{poll.totalVotes} Votes Cast</span>
        </div>

        <div className="space-y-3">
          {poll.options.map(opt => {
            const isVoted = poll.userVoted === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => voteDish(opt.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  isVoted
                    ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500'
                    : 'bg-slate-800 border-slate-700 hover:border-emerald-500/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-base font-black">{opt.name}</span>
                  {isVoted ? (
                    <span className="p-1 rounded-full bg-emerald-500 text-white">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">Tap to vote</span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">{opt.votes} votes</span>
                    <span className="text-emerald-400">{opt.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${opt.percent}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {poll.userVoted && (
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold text-center">
            ✔ Vote recorded. +30 Health Points earned.
          </div>
        )}
      </div>

    </div>
  );
};
