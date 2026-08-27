import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Vote, Check, Clock, Plus, Sparkles, AlertCircle } from 'lucide-react';

export const VotingPage = () => {
  const { 
    poll, 
    voteDish, 
    userVotedOptionId, 
    currentRole,
    createPoll 
  } = useApp();

  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [dishToReplace, setDishToReplace] = useState('');
  const [opt1Name, setOpt1Name] = useState('');
  const [opt1Protein, setOpt1Protein] = useState('');
  const [opt2Name, setOpt2Name] = useState('');
  const [opt2Protein, setOpt2Protein] = useState('');
  const [opt3Name, setOpt3Name] = useState('');
  const [opt3Protein, setOpt3Protein] = useState('');
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  const isStaff = currentRole === 'mess_committee' || currentRole === 'warden';

  const handleVote = async (optionId) => {
    if (userVotedOptionId || isSubmittingVote) return;
    try {
      setIsSubmittingVote(true);
      await voteDish(optionId);
    } catch (e) {
      console.error('Voting failed:', e);
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const handleCreatePollSubmit = async (e) => {
    e.preventDefault();
    if (!dishToReplace || !opt1Name || !opt2Name) return;

    const options = [
      { name: opt1Name, protein: opt1Protein ? `${opt1Protein}g` : '12g' },
      { name: opt2Name, protein: opt2Protein ? `${opt2Protein}g` : '14g' },
    ];
    if (opt3Name) {
      options.push({ name: opt3Name, protein: opt3Protein ? `${opt3Protein}g` : '15g' });
    }

    await createPoll({
      dishToReplace,
      options,
      closingDate: 'End of Month'
    });

    setShowCreatePoll(false);
    setDishToReplace('');
    setOpt1Name('');
    setOpt2Name('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Vote className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Monthly Mess Voting
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Democratic dish replacement polls • Earn <strong className="text-emerald-600 dark:text-emerald-400">+10 Health Points</strong> per vote
          </p>
        </div>

        {isStaff && (
          <button
            onClick={() => setShowCreatePoll(!showCreatePoll)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>{showCreatePoll ? 'Close' : 'New Poll'}</span>
          </button>
        )}
      </div>

      {/* Staff Create Poll Form */}
      {isStaff && showCreatePoll && (
        <form onSubmit={handleCreatePollSubmit} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-md">
          <h3 className="text-xs font-black uppercase text-purple-600 dark:text-purple-400">Launch Dish Replacement Poll</h3>
          
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dish to Replace</label>
            <input
              type="text"
              required
              placeholder="e.g. Lauki Sabji (Sunday Dinner)"
              value={dishToReplace}
              onChange={e => setDishToReplace(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Option 1 Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Paneer Bhurji"
                value={opt1Name}
                onChange={e => setOpt1Name(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Protein (g)</label>
              <input
                type="number"
                placeholder="18"
                value={opt1Protein}
                onChange={e => setOpt1Protein(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Option 2 Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Soya Chaap Masala"
                value={opt2Name}
                onChange={e => setOpt2Name(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Protein (g)</label>
              <input
                type="number"
                placeholder="22"
                value={opt2Protein}
                onChange={e => setOpt2Protein(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md mt-2"
          >
            Publish Poll to Students
          </button>
        </form>
      )}

      {/* Voting Poll Card or Empty State */}
      {poll ? (
        <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-5 shadow-xl border border-slate-800">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold border-b border-slate-800 pb-3">
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Status: Active Monthly Poll</span>
            </span>
            <span className="text-emerald-400 font-bold">{poll.totalVotes} Total Student Votes</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Proposed Dish Replacement</span>
            <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
              Which dish should replace <span className="text-amber-400 underline">{poll.dishToReplace}</span>?
            </h2>
          </div>

          <div className="space-y-3">
            {poll.options.map(opt => {
              const isVoted = userVotedOptionId === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    if (!userVotedOptionId) handleVote(opt.id);
                  }}
                  className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    isVoted
                      ? 'bg-purple-600/20 border-purple-500 ring-2 ring-purple-500'
                      : userVotedOptionId
                      ? 'bg-slate-800/60 border-slate-800 opacity-80'
                      : 'bg-slate-800 border-slate-700 hover:border-purple-500/60 cursor-pointer'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm sm:text-base font-black">{opt.name}</span>
                      <span className="text-xs text-emerald-400 font-bold">({opt.protein})</span>
                    </div>

                    {isVoted ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Your Vote</span>
                      </span>
                    ) : !userVotedOptionId ? (
                      <span className="text-xs font-bold text-purple-400 hover:underline">Tap to vote</span>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">{opt.votes} votes</span>
                      <span className="text-purple-400">{opt.percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${opt.percent}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {userVotedOptionId ? (
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-bold text-center border border-purple-500/30 flex items-center justify-center space-x-1.5">
              <Check className="w-4 h-4 text-purple-400" />
              <span>Vote recorded. +10 Health Points awarded! Thank you for participating.</span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 text-center">
              Each student can cast 1 vote per monthly poll. Votes are immutable once submitted.
            </p>
          )}
        </div>
      ) : (
        <div className="p-12 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-base font-black text-slate-700 dark:text-slate-200">No active voting right now.</p>
          <p>When the Mess Committee launches a dish replacement poll, it will appear here.</p>
        </div>
      )}

    </div>
  );
};
