import React from 'react';
import { useApp } from '../context/AppContext';
import { Vote, Check, Clock } from 'lucide-react';

export const VotingPage = () => {
  const { poll, voteDish, userVotedOptionId } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          DISH REPLACEMENT VOTING
        </h1>
        <p className="text-xs text-slate-500 font-bold mt-1">
          {poll ? `Help decide the replacement for: ${poll.dishToReplace}` : 'Vote on upcoming menu changes and dish replacements'}
        </p>
      </div>

      {/* Voting Poll Card or Empty State */}
      {poll ? (
        <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-5 shadow-xl border border-slate-800">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold border-b border-slate-800 pb-3">
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Closes: {poll.closingDate}</span>
            </span>
            <span className="text-emerald-400 font-bold">{poll.totalVotes} Total Votes</span>
          </div>

          <div className="space-y-3">
            {poll.options.map(opt => {
              const isVoted = userVotedOptionId === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    if (!userVotedOptionId) voteDish(opt.id);
                  }}
                  className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    isVoted
                      ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500'
                      : userVotedOptionId
                      ? 'bg-slate-800/60 border-slate-800 opacity-80'
                      : 'bg-slate-800 border-slate-700 hover:border-emerald-500/50 cursor-pointer'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm sm:text-base font-black">{opt.name}</span>
                      <span className="text-xs text-emerald-400 font-bold">({opt.protein})</span>
                    </div>

                    {isVoted ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Your Vote</span>
                      </span>
                    ) : !userVotedOptionId ? (
                      <span className="text-xs font-bold text-slate-400">Tap to vote</span>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">{opt.votes} votes</span>
                      <span className="text-emerald-400">{opt.percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${opt.percent}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {userVotedOptionId && (
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold text-center border border-emerald-500/30">
              ✔ Vote recorded. Thank you for participating.
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-base font-black text-slate-700 dark:text-slate-200">No active voting polls.</p>
          <p>When the Mess Committee launches a dish replacement poll, it will appear here.</p>
        </div>
      )}

    </div>
  );
};
