import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Vote, 
  Check, 
  Clock, 
  Plus, 
  Inbox, 
  CheckCircle2,
  X
} from 'lucide-react';

export const VotingPage = () => {
  const { 
    poll, 
    voteDish, 
    userVotedOptionId, 
    currentRole,
    createPoll,
    closePoll,
    currentWeekInfo
  } = useApp();

  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Staff Poll Creation Form State
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [question, setQuestion] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [opt4, setOpt4] = useState('');

  const isStaff = currentRole === 'mess_committee' || currentRole === 'warden';

  // Handle Student Vote Submission
  const handleVoteSubmit = async () => {
    if (!selectedOptionId || userVotedOptionId || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await voteDish(selectedOptionId);
      setSelectedOptionId(null);
    } catch (e) {
      console.error('Voting failed:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Staff Poll Creation
  const handleCreatePollSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !opt1.trim() || !opt2.trim() || !opt3.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const options = [
        { name: opt1.trim() },
        { name: opt2.trim() },
        { name: opt3.trim() }
      ];
      if (opt4.trim()) {
        options.push({ name: opt4.trim() });
      }

      await createPoll({
        question: question.trim(),
        options,
        closingDate: `End of Week (${currentWeekInfo?.weekEndStr || 'Sunday'})`
      });

      setShowCreatePoll(false);
      setQuestion('');
      setOpt1('');
      setOpt2('');
      setOpt3('');
      setOpt4('');
    } catch (err) {
      console.error('Error creating poll:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isActivePoll = poll && poll.status === 'ACTIVE';
  const isClosedPoll = poll && poll.status === 'CLOSED';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Vote className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Weekly Voting
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Your weekly voice helps shape mess meals and decisions.
            </p>
          </div>
        </div>

        {isStaff && (
          <button
            onClick={() => setShowCreatePoll(!showCreatePoll)}
            className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto transition-all"
          >
            {showCreatePoll ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showCreatePoll ? 'Cancel' : 'Create Poll'}</span>
          </button>
        )}
      </div>

      {/* 2. STAFF CREATE POLL CARD */}
      {isStaff && showCreatePoll && (
        <form onSubmit={handleCreatePollSubmit} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                Create Weekly Mess Poll
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold">
                Scoped to current cycle ({currentWeekInfo?.weekId || 'This Week'})
              </p>
            </div>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full">
              Mess Committee
            </span>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
              Poll Question <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Which dessert should be served for Sunday dinner?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-2.5 pt-1">
            <span className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400">
              Voting Options (Min 3 required)
            </span>

            <div>
              <input
                type="text"
                required
                placeholder="Option 1 *"
                value={opt1}
                onChange={e => setOpt1(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <input
                type="text"
                required
                placeholder="Option 2 *"
                value={opt2}
                onChange={e => setOpt2(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <input
                type="text"
                required
                placeholder="Option 3 *"
                value={opt3}
                onChange={e => setOpt3(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Option 4 (Optional)"
                value={opt4}
                onChange={e => setOpt4(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowCreatePoll(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Poll to Students'}
            </button>
          </div>
        </form>
      )}

      {/* 3. MAIN POLL INTERFACE */}
      {isActivePoll ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-purple-500/20 dark:border-purple-500/30 space-y-6 shadow-xl">
          
          {/* Card Meta & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-2 text-xs">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                ACTIVE POLL
              </span>
              {poll.weekId && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/10 text-purple-700 dark:text-purple-400">
                  {poll.weekId}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {poll.totalVotes || 0} {poll.totalVotes === 1 ? 'student vote' : 'student votes'}
              </span>
              {isStaff && (
                <button
                  onClick={() => closePoll(poll.id)}
                  className="px-3 py-1 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Poll
                </button>
              )}
            </div>
          </div>

          {/* Question */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Mess Committee Question
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
              {poll.question}
            </h2>
          </div>

          {/* Voted Confirmation Banner */}
          {userVotedOptionId && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>Vote recorded. You have already voted in this poll.</span>
            </div>
          )}

          {/* Options Display */}
          <div className="space-y-3">
            {(poll.options || []).map(opt => {
              const isVoted = userVotedOptionId === opt.id;
              const isSelected = selectedOptionId === opt.id;

              // If student has already voted: show final distribution percentages
              if (userVotedOptionId) {
                return (
                  <div
                    key={opt.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2 ${
                      isVoted
                        ? 'bg-purple-600/10 border-purple-500 dark:bg-purple-950/30'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center text-sm font-black text-slate-900 dark:text-white">
                      <div className="flex items-center space-x-2">
                        <span>{opt.name}</span>
                        {opt.protein && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                            ({opt.protein})
                          </span>
                        )}
                      </div>

                      {isVoted && (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Your Vote</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500 dark:text-slate-400">
                          {opt.votes || 0} {opt.votes === 1 ? 'vote' : 'votes'}
                        </span>
                        <span className="text-purple-600 dark:text-purple-400">{opt.percent || 0}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${opt.percent || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              // If student has not voted yet: show radio selection cards
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600/10 border-purple-600 ring-2 ring-purple-600/20 dark:bg-purple-950/30'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {opt.name}
                    </span>
                    {opt.protein && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        ({opt.protein})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Button for Unvoted Students */}
          {!userVotedOptionId && (
            <div className="pt-2 space-y-2">
              <button
                onClick={handleVoteSubmit}
                disabled={!selectedOptionId || isSubmitting}
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-black shadow-lg shadow-purple-600/20 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Recording Vote...' : 'Submit Vote'}
              </button>
              <p className="text-[11px] text-slate-400 text-center font-medium">
                You can cast 1 vote per active poll. Votes cannot be changed once submitted.
              </p>
            </div>
          )}

          {poll.closingDate && (
            <p className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100 dark:border-slate-800 font-medium">
              Poll scheduled until: <strong className="text-slate-600 dark:text-slate-300">{poll.closingDate}</strong>
            </p>
          )}

        </div>
      ) : isClosedPoll ? (
        /* CLOSED POLL RESULTS VIEW */
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-2 text-xs">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                POLL CLOSED
              </span>
              {poll.weekId && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {poll.weekId}
                </span>
              )}
            </div>

            <span className="text-xs font-bold text-slate-500">
              {poll.totalVotes || 0} Total Responses
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Recent Poll Results
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
              {poll.question}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
              This poll has concluded. Final student voting breakdown:
            </p>
          </div>

          <div className="space-y-3">
            {(poll.options || []).map(opt => {
              const isVoted = userVotedOptionId === opt.id;

              return (
                <div
                  key={opt.id}
                  className={`p-4 rounded-2xl border space-y-2 ${
                    isVoted
                      ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center text-sm font-black text-slate-900 dark:text-white">
                    <div className="flex items-center space-x-2">
                      <span>{opt.name}</span>
                      {opt.protein && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                          ({opt.protein})
                        </span>
                      )}
                    </div>
                    {isVoted && (
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Your Vote</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400">
                        {opt.votes || 0} votes
                      </span>
                      <span className="text-purple-600 dark:text-purple-400">{opt.percent || 0}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${opt.percent || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 4. CLEAN EMPTY STATE (No active poll right now) */
        <div className="p-12 sm:p-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            No active poll right now.
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
            Check back when the Mess Committee publishes the next weekly poll.
          </p>
        </div>
      )}

    </div>
  );
};
