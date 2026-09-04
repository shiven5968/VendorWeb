import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Vote, 
  Check, 
  Clock, 
  Plus, 
  Sparkles, 
  Star, 
  Calendar, 
  Flame, 
  Dumbbell, 
  History, 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Award,
  Utensils
} from 'lucide-react';
import { formatCollegeDateTime } from '../utils/dateTime';

export const VotingPage = () => {
  const { 
    poll, 
    voteDish, 
    userVotedOptionId, 
    currentRole,
    createPoll,
    allMeals,
    todayDay,
    voteWeeklyMeal,
    hasUserVotedThisWeek,
    getStudentVotingHistory,
    getOverallMealPerformance,
    getMonthlyVotingSummary,
    currentWeekInfo
  } = useApp();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history' | 'performance' | 'summary'
  const [selectedDay, setSelectedDay] = useState(todayDay || 'Monday');
  const [pendingRatings, setPendingRatings] = useState({}); // mealId -> rating
  const [hoverRatings, setHoverRatings] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(0);

  // Staff Dish Replacement Poll State
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [dishToReplace, setDishToReplace] = useState('');
  const [opt1Name, setOpt1Name] = useState('');
  const [opt1Protein, setOpt1Protein] = useState('');
  const [opt2Name, setOpt2Name] = useState('');
  const [opt2Protein, setOpt2Protein] = useState('');
  const [opt3Name, setOpt3Name] = useState('');
  const [opt3Protein, setOpt3Protein] = useState('');

  const isStaff = currentRole === 'mess_committee' || currentRole === 'warden';

  // Weekly History & Analytics Data
  const votingHistory = useMemo(() => getStudentVotingHistory(), [getStudentVotingHistory]);
  const overallPerformance = useMemo(() => getOverallMealPerformance(), [getOverallMealPerformance]);
  const monthlySummary = useMemo(() => getMonthlyVotingSummary(), [getMonthlyVotingSummary]);

  // Days list for weekly meal rating
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Filter meals for the selected day in Weekly Voting
  const dayMeals = useMemo(() => {
    return (allMeals || []).filter(m => m.day?.toLowerCase() === selectedDay.toLowerCase());
  }, [allMeals, selectedDay]);

  // Handle Committee Poll Vote
  const handleVotePoll = async (optionId) => {
    if (userVotedOptionId || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await voteDish(optionId);
    } catch (e) {
      console.error('Poll voting failed:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Weekly Meal Feedback Vote (1-5 Stars)
  const handleVoteMeal = async (meal) => {
    const rating = pendingRatings[meal.id] || 5;
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await voteWeeklyMeal({
        mealId: meal.id,
        mealName: meal.name,
        mealCategory: meal.category,
        rating
      });
      // Clear pending rating after submission
      setPendingRatings(prev => {
        const next = { ...prev };
        delete next[meal.id];
        return next;
      });
    } catch (e) {
      console.error('Meal voting failed:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Staff Create Dish Replacement Poll Submit
  const handleCreatePollSubmit = async (e) => {
    e.preventDefault();
    if (!dishToReplace.trim() || !opt1Name.trim() || !opt2Name.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const options = [
        { name: opt1Name.trim(), protein: opt1Protein ? `${opt1Protein}g` : '12g' },
        { name: opt2Name.trim(), protein: opt2Protein ? `${opt2Protein}g` : '14g' },
      ];
      if (opt3Name.trim()) {
        options.push({ name: opt3Name.trim(), protein: opt3Protein ? `${opt3Protein}g` : '15g' });
      }

      await createPoll({
        dishToReplace: dishToReplace.trim(),
        options,
        closingDate: 'End of Week'
      });

      setShowCreatePoll(false);
      setDishToReplace('');
      setOpt1Name('');
      setOpt1Protein('');
      setOpt2Name('');
      setOpt2Protein('');
      setOpt3Name('');
      setOpt3Protein('');
    } catch (err) {
      console.error('Error creating poll:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (stars) => {
    switch (stars) {
      case 1: return '1★ Needs Improvement';
      case 2: return '2★ Below Average';
      case 3: return '3★ Average / Acceptable';
      case 4: return '4★ Tasty & Good';
      case 5: return '5★ Excellent Quality';
      default: return 'Rate 1 to 5 Stars';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* 1. MAIN HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Voting & Meal Feedback
              </h1>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                Your weekly voice helps improve the mess. Rate dishes & vote on replacements.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <div className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-2xl text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>+10 Health Points per vote</span>
          </div>

          {isStaff && (
            <button
              onClick={() => setShowCreatePoll(!showCreatePoll)}
              className="px-3 py-1.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showCreatePoll ? 'Close' : 'New Poll'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. CURRENT WEEK BANNER (Asia/Kolkata) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-blue-500/10 border border-emerald-500/20 dark:border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
              {currentWeekInfo?.weekId || 'Weekly Cycle'}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Asia/Kolkata Official Schedule</span>
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            CURRENT WEEK: {currentWeekInfo?.weekRangeDisplay}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mess meals repeat weekly. Rate your meals for this week — you can rate them again next week to track preparation changes!
          </p>
        </div>
      </div>

      {/* Staff Create Dish Replacement Poll Form */}
      {isStaff && showCreatePoll && (
        <form onSubmit={handleCreatePollSubmit} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-purple-500/30 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-black uppercase text-purple-600 dark:text-purple-400">
              Launch Dish Replacement Poll ({currentWeekInfo?.weekId})
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">Scoped to current weekly cycle</span>
          </div>
          
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
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-black shadow-md mt-2 cursor-pointer transition-colors"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Poll to Students'}
          </button>
        </form>
      )}

      {/* 3. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 min-w-[130px] flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Active Voting</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 min-w-[130px] flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Weekly History</span>
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`flex-1 min-w-[140px] flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'performance'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Overall Performance</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 min-w-[130px] flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'summary'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Monthly Summary</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE WEEKLY VOTING */}
      {/* ========================================================================= */}
      {activeTab === 'active' && (
        <div className="space-y-6">

          {/* 1A. ACTIVE COMMITTEE REPLACEMENT POLL (If open) */}
          {poll && (
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-5 shadow-xl border border-purple-500/30">
              <div className="flex justify-between items-center text-xs text-slate-400 font-semibold border-b border-slate-800 pb-3">
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Committee Poll · Week {currentWeekInfo?.weekNumber || 36}</span>
                </span>
                <span className="text-emerald-400 font-bold">{poll.totalVotes || 0} Total Student Votes</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Proposed Dish Replacement
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  Which dish should replace <span className="text-amber-400 underline">{poll.dishToReplace}</span>?
                </h2>
              </div>

              <div className="space-y-3">
                {(poll.options || []).map(opt => {
                  const isVoted = userVotedOptionId === opt.id;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        if (!userVotedOptionId) handleVotePoll(opt.id);
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
                          <span className="text-slate-400">{opt.votes || 0} votes</span>
                          <span className="text-purple-400">{opt.percent || 0}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 transition-all duration-500" 
                            style={{ width: `${opt.percent || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {userVotedOptionId ? (
                <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-bold text-center border border-purple-500/30 flex items-center justify-center space-x-1.5">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Vote recorded for this week. +10 Health Points awarded!</span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 text-center">
                  Each student can cast 1 vote per active poll. You earn +10 Health Points on submission.
                </p>
              )}
            </div>
          )}

          {/* 1B. RECURRING WEEKLY MEAL FEEDBACK CARDS */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Rate This Week's Mess Meals
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Review dishes served in the mess schedule this week ({currentWeekInfo?.weekRangeDisplay}).
                </p>
              </div>

              {/* Day Selector */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {daysOfWeek.map(day => {
                  const isSelected = selectedDay.toLowerCase() === day.toLowerCase();
                  const isToday = todayDay?.toLowerCase() === day.toLowerCase();
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-purple-300'
                      }`}
                    >
                      <span>{day.slice(0, 3)}</span>
                      {isToday && (
                        <span className="ml-1 px-1 py-0.2 rounded-full text-[9px] bg-emerald-500 text-white font-black">
                          Today
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meals for Selected Day */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dayMeals.length > 0 ? (
                dayMeals.map(meal => {
                  const voted = hasUserVotedThisWeek(meal.id) || hasUserVotedThisWeek(meal.name);
                  const currentSelectedRating = pendingRatings[meal.id] || 0;
                  const currentHoverRating = hoverRatings[meal.id] || 0;
                  const effectiveRating = currentHoverRating || currentSelectedRating;

                  return (
                    <div
                      key={meal.id}
                      className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all space-y-4 shadow-sm ${
                        voted
                          ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
                          : 'border-slate-200/80 dark:border-slate-800 hover:border-purple-500/40'
                      }`}
                    >
                      {/* Card Header: Category & Name */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              {meal.category}
                            </span>
                            <span className="text-[11px] text-slate-400 font-bold">
                              {meal.time}
                            </span>
                          </div>
                          <h4 className="text-base font-black text-slate-900 dark:text-white mt-1 leading-snug">
                            {meal.name}
                          </h4>
                        </div>

                        {voted && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1 flex-shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Voted</span>
                          </span>
                        )}
                      </div>

                      {/* Items description & nutrition */}
                      {meal.items && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {meal.items}
                        </p>
                      )}

                      <div className="flex items-center space-x-3 text-xs text-slate-500 font-bold">
                        {meal.calories && (
                          <div className="flex items-center space-x-1">
                            <Flame className="w-3.5 h-3.5 text-amber-500" />
                            <span>{meal.calories} kcal</span>
                          </div>
                        )}
                        {meal.protein && (
                          <div className="flex items-center space-x-1">
                            <Dumbbell className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{meal.protein}g protein</span>
                          </div>
                        )}
                      </div>

                      {/* Voting / Feedback State */}
                      {voted ? (
                        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-black">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Vote recorded this week</span>
                            </div>
                            <div className="flex items-center space-x-1 text-amber-500 text-xs font-black">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= (voted.rating || 5)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300 dark:text-slate-700'
                                  }`}
                                />
                              ))}
                              <span className="ml-1 text-slate-700 dark:text-slate-300 font-black">
                                ({voted.rating || 5}★)
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            You can vote again when this meal is reviewed in a new week.
                          </p>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400">
                              {effectiveRating > 0 ? getRatingLabel(effectiveRating) : 'Rate this week\'s dish:'}
                            </span>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setPendingRatings(p => ({ ...p, [meal.id]: star }))}
                                  onMouseEnter={() => setHoverRatings(h => ({ ...h, [meal.id]: star }))}
                                  onMouseLeave={() => setHoverRatings(h => ({ ...h, [meal.id]: 0 }))}
                                  className="p-1 rounded-lg transition-transform hover:scale-125 cursor-pointer"
                                  aria-label={`Rate ${star} star`}
                                >
                                  <Star
                                    className={`w-5 h-5 transition-colors ${
                                      star <= effectiveRating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-300 dark:text-slate-700 hover:text-amber-300'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={isSubmitting || !currentSelectedRating}
                            onClick={() => handleVoteMeal(meal)}
                            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>
                              {isSubmitting ? 'Recording...' : currentSelectedRating ? 'Submit Weekly Feedback (+10 Health Pts)' : 'Select 1–5 Stars to Submit'}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 p-12 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-base font-black text-slate-700 dark:text-slate-200">No meals scheduled for {selectedDay}</p>
                  <p>Choose another day from the bar above to vote on weekly meals.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WEEKLY HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              My Weekly Voting History
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Inspect your past meal reviews across weekly cycles. Locked upon cycle completion.
            </p>

            {/* Week Selector Pills */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
              {votingHistory.map((week, index) => {
                const isSelected = selectedHistoryIndex === index;
                return (
                  <button
                    key={week.weekId}
                    onClick={() => setSelectedHistoryIndex(index)}
                    className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{week.label}</span>
                    <span className="ml-1 text-[10px] opacity-75">({week.votes.length})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Week History Details */}
          {votingHistory[selectedHistoryIndex] && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-500">
                  {votingHistory[selectedHistoryIndex].weekRangeDisplay} ({votingHistory[selectedHistoryIndex].weekId})
                </span>
                <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                  {votingHistory[selectedHistoryIndex].votes.length} Votes Cast
                </span>
              </div>

              {votingHistory[selectedHistoryIndex].votes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {votingHistory[selectedHistoryIndex].votes.map((vote, idx) => (
                    <div
                      key={vote.id || idx}
                      className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                            {vote.mealCategory || (vote.pollId ? 'Dish Poll' : 'Meal Review')}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                            {vote.mealName || vote.pollId || 'Weekly Feedback'}
                          </h4>
                        </div>

                        {vote.rating ? (
                          <div className="flex items-center space-x-0.5 text-amber-500 text-xs font-black">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{vote.rating}★</span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700">
                            Voted
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                        <span>
                          {vote.timestamp ? formatCollegeDateTime(new Date(vote.timestamp)) : 'Recorded'}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          +10 Pts Earned
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-base font-black text-slate-700 dark:text-slate-200">
                    No votes recorded for {votingHistory[selectedHistoryIndex].label}
                  </p>
                  <p>Cast your vote in the Active Voting tab to earn +10 Health Points each week!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: OVERALL PERFORMANCE */}
      {/* ========================================================================= */}
      {activeTab === 'performance' && (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Overall Dish Performance
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Aggregated student ratings across all recurring weekly cycles. Multi-week averages reflect genuine student consensus.
            </p>
          </div>

          {overallPerformance.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {overallPerformance.map((dish, index) => (
                <div
                  key={dish.mealName || index}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-400">
                          #{index + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                          {dish.mealCategory}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1.5">
                        {dish.mealName}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-1 text-amber-500 text-sm font-black bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-xl">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{dish.avgRating}★</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between text-xs text-slate-400 font-semibold">
                    <span>{dish.totalVotes} total reviews</span>
                    <span className="text-purple-600 dark:text-purple-400 font-bold">
                      {dish.weeksCount} week{dish.weeksCount > 1 ? 's' : ''} recorded
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-base font-black text-slate-700 dark:text-slate-200">
                No multi-week feedback recorded yet
              </p>
              <p>As students cast weekly votes on recurring mess meals, performance averages appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MONTHLY SUMMARY */}
      {/* ========================================================================= */}
      {activeTab === 'summary' && (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Monthly Voting Summary
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Campus-wide metrics and sentiment overview for {monthlySummary.monthLabel}
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-black text-xs border border-purple-200 dark:border-purple-800">
                {monthlySummary.monthLabel}
              </span>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Votes Cast</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{monthlySummary.totalVotes}</div>
              <p className="text-[11px] text-slate-500">Student submissions this month</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Average Mess Rating</span>
              <div className="text-2xl font-black text-amber-500 flex items-center space-x-1">
                <span>{monthlySummary.avgRating}</span>
                {monthlySummary.avgRating !== '—' && <Star className="w-5 h-5 fill-current" />}
              </div>
              <p className="text-[11px] text-slate-500">Out of 5.0 maximum</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Top Rated Dish</span>
              <div className="text-sm font-black text-slate-900 dark:text-white truncate" title={monthlySummary.topDish}>
                {monthlySummary.topDish}
              </div>
              <p className="text-[11px] text-slate-500">Highest student satisfaction</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Needs Attention</span>
              <div className="text-sm font-black text-slate-900 dark:text-white truncate" title={monthlySummary.lowestDish}>
                {monthlySummary.lowestDish}
              </div>
              <p className="text-[11px] text-slate-500">Candidate for replacement poll</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <h4 className="font-black text-slate-900 dark:text-white uppercase text-[11px] flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>How Mess Authorities Use This Data</span>
            </h4>
            <p>
              Monthly voting summaries and dish ratings are reviewed directly by the Mess Committee and Chief Warden Anita Kumar during weekly procurement meetings. Dishes with consistently low ratings are prioritized for democratic replacement polls.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
