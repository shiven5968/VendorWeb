import React, { useState, useMemo } from 'react';
import {
  Star,
  Download,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Award,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Utensils
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { getCollegeDateString, getPastCollegeDateString, formatCollegeDateTime } from '../../utils/dateTime';
import { generateSatisfactionPdf } from '../../utils/satisfactionReportPdf';

const THEME_KEYWORDS = {
  Taste: ['taste', 'flavor', 'tasty', 'delicious', 'spicy', 'bland', 'salt', 'masala', 'sweet'],
  Quality: ['quality', 'fresh', 'stale', 'texture', 'oil', 'cooked', 'raw', 'undercooked', 'overcooked'],
  Temperature: ['hot', 'cold', 'warm', 'temperature'],
  Variety: ['variety', 'repeat', 'same', 'monotonous', 'menu', 'different'],
  Quantity: ['quantity', 'less', 'portion', 'enough', 'shortage', 'limited'],
  Cleanliness: ['clean', 'hygiene', 'dirty', 'hair', 'insect', 'fly', 'wash', 'plate', 'spoon']
};

export const StudentSatisfactionModule = ({
  mode = 'committee', // 'committee' | 'officials'
  allRatings = [],
  allComplaints = [],
  allMeals = [],
  hygieneChecks = [],
  onNavigate
}) => {
  const todayStr = getCollegeDateString();

  // ── FILTER STATE ─────────────────────────────────────────────────────────
  const [periodFilter, setPeriodFilter] = useState('7days'); // 'today' | '7days' | '30days' | 'custom'
  const [customStart, setCustomStart] = useState(getPastCollegeDateString(7));
  const [customEnd, setCustomEnd] = useState(todayStr);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfNotification, setPdfNotification] = useState('');

  // ── RESOLVE ACTIVE DATE RANGE ────────────────────────────────────────────
  const { startDate, endDate, periodLabel } = useMemo(() => {
    if (periodFilter === 'today') {
      return { startDate: todayStr, endDate: todayStr, periodLabel: 'Today' };
    }
    if (periodFilter === '7days') {
      return { startDate: getPastCollegeDateString(6), endDate: todayStr, periodLabel: 'Last 7 Days' };
    }
    if (periodFilter === '30days') {
      return { startDate: getPastCollegeDateString(29), endDate: todayStr, periodLabel: 'Last 30 Days' };
    }
    return {
      startDate: customStart || getPastCollegeDateString(7),
      endDate: customEnd || todayStr,
      periodLabel: 'Custom Range'
    };
  }, [periodFilter, customStart, customEnd, todayStr]);

  // ── FILTERED DATA SETS ───────────────────────────────────────────────────
  const periodRatings = useMemo(() => {
    return (allRatings || []).filter(r => {
      if (!r.timestamp) return false;
      const rDate = r.timestamp.split('T')[0];
      return rDate >= startDate && rDate <= endDate;
    });
  }, [allRatings, startDate, endDate]);

  const periodComplaints = useMemo(() => {
    return (allComplaints || []).filter(c => {
      if (!c.timestamp) return false;
      const cDate = c.timestamp.split('T')[0];
      return cDate >= startDate && cDate <= endDate;
    });
  }, [allComplaints, startDate, endDate]);

  // ── CORE SATISFACTION METRICS ────────────────────────────────────────────
  const metrics = useMemo(() => {
    const total = periodRatings.length;
    if (total === 0) {
      return {
        totalRatings: 0,
        avgRating: null,
        satisfactionRate: null,
        positiveRatings: 0,
        lowRatings: 0,
        neutralRatings: 0,
        feedbackCount: 0,
        status: 'No Data'
      };
    }

    let sum = 0;
    let positive = 0;
    let low = 0;
    let neutral = 0;
    let feedback = 0;

    periodRatings.forEach(r => {
      const val = typeof r.rating === 'number' ? r.rating : 0;
      sum += val;
      if (val >= 4) positive++;
      else if (val <= 2) low++;
      else neutral++;

      if (r.feedback && r.feedback.trim().length > 0) {
        feedback++;
      }
    });

    const avg = parseFloat((sum / total).toFixed(1));
    const satRate = Math.round((positive / total) * 100);

    let status = 'Good';
    if (satRate >= 90) status = 'Excellent';
    else if (satRate >= 75) status = 'Good';
    else if (satRate >= 50) status = 'Needs Attention';
    else status = 'Critical';

    return {
      totalRatings: total,
      avgRating: avg,
      satisfactionRate: satRate,
      positiveRatings: positive,
      lowRatings: low,
      neutralRatings: neutral,
      feedbackCount: feedback,
      status
    };
  }, [periodRatings]);

  // ── MEAL-WISE SATISFACTION ───────────────────────────────────────────────
  const mealStats = useMemo(() => {
    const categories = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

    return categories.map(cat => {
      const catRatings = periodRatings.filter(r => {
        const mealCat = r.mealCategory || '';
        if (mealCat.toLowerCase() === cat.toLowerCase()) return true;

        // Fallback: match by mealId prefix or meal time
        const mId = (r.mealId || '').toLowerCase();
        if (cat === 'Breakfast' && (mId.includes('break') || mId.includes('_b'))) return true;
        if (cat === 'Lunch' && (mId.includes('lunch') || mId.includes('_l'))) return true;
        if (cat === 'Snacks' && (mId.includes('snack') || mId.includes('_s'))) return true;
        if (cat === 'Dinner' && (mId.includes('dinner') || mId.includes('_d'))) return true;
        return false;
      });

      // Find relevant meal names from allMeals
      const matchingMeals = (allMeals || []).filter(m => m.category === cat);
      const repDishName = matchingMeals.length > 0
        ? matchingMeals.slice(0, 2).map(m => m.name).join(', ')
        : 'Scheduled Items';

      if (catRatings.length === 0) {
        return {
          category: cat,
          name: repDishName,
          avgRating: null,
          totalRatings: 0,
          satisfactionRate: null,
          feedbackCount: 0
        };
      }

      const total = catRatings.length;
      let sum = 0;
      let pos = 0;
      let fbCount = 0;

      catRatings.forEach(r => {
        sum += r.rating || 0;
        if ((r.rating || 0) >= 4) pos++;
        if (r.feedback && r.feedback.trim()) fbCount++;
      });

      const avg = parseFloat((sum / total).toFixed(1));
      const sat = Math.round((pos / total) * 100);

      return {
        category: cat,
        name: repDishName,
        avgRating: avg,
        totalRatings: total,
        satisfactionRate: sat,
        feedbackCount: fbCount
      };
    });
  }, [periodRatings, allMeals]);

  // ── LOW-RATED & TOP-PERFORMING MEALS ─────────────────────────────────────
  const { lowRatedMeals, topMeals } = useMemo(() => {
    const dishMap = {};

    periodRatings.forEach(r => {
      const dish = r.mealName || r.mealId;
      if (!dish) return;
      if (!dishMap[dish]) {
        dishMap[dish] = {
          name: dish,
          category: r.mealCategory || 'Meal',
          ratings: []
        };
      }
      if (typeof r.rating === 'number') {
        dishMap[dish].ratings.push(r.rating);
      }
    });

    const dishList = Object.values(dishMap).map(d => {
      const count = d.ratings.length;
      const sum = d.ratings.reduce((a, b) => a + b, 0);
      const avg = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;
      return {
        name: d.name,
        category: d.category,
        avgRating: avg,
        count
      };
    });

    // Filter minimum 1 rating
    const rated = dishList.filter(d => d.count >= 1);

    const low = [...rated].sort((a, b) => a.avgRating - b.avgRating).slice(0, 4);
    const top = [...rated].sort((a, b) => b.avgRating - a.avgRating).slice(0, 4);

    return { lowRatedMeals: low, topMeals: top };
  }, [periodRatings]);

  // ── FEEDBACK THEMES EXTRACTION ───────────────────────────────────────────
  const feedbackThemes = useMemo(() => {
    const themeCounts = {
      Taste: 0,
      Quality: 0,
      Temperature: 0,
      Variety: 0,
      Quantity: 0,
      Cleanliness: 0,
      Other: 0
    };

    let totalMentions = 0;

    periodRatings.forEach(r => {
      const text = `${r.feedback || ''} ${(r.tags || []).join(' ')}`.toLowerCase();
      if (!text.trim()) return;

      let matched = false;
      for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
        if (keywords.some(kw => text.includes(kw))) {
          themeCounts[theme]++;
          matched = true;
          totalMentions++;
        }
      }
      if (!matched && r.feedback && r.feedback.trim()) {
        themeCounts.Other++;
        totalMentions++;
      }
    });

    // Also parse complaints for themes
    periodComplaints.forEach(c => {
      const text = `${c.category || ''} ${c.description || ''}`.toLowerCase();
      for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
        if (keywords.some(kw => text.includes(kw))) {
          themeCounts[theme]++;
          totalMentions++;
        }
      }
    });

    return Object.entries(themeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [periodRatings, periodComplaints]);

  // ── RECENT STUDENT FEEDBACK (PRIVACY-SAFE) ────────────────────────────────
  const recentFeedback = useMemo(() => {
    return periodRatings
      .filter(r => r.feedback && r.feedback.trim().length > 0)
      .slice(0, 6)
      .map(r => ({
        id: r.id || String(Math.random()),
        rating: r.rating,
        comment: r.feedback,
        mealName: r.mealName || r.mealCategory || 'Meal',
        date: r.timestamp ? r.timestamp.split('T')[0] : todayStr
      }));
  }, [periodRatings, todayStr]);

  // ── SATISFACTION TREND DATA ──────────────────────────────────────────────
  const trendData = useMemo(() => {
    const dayMap = {};

    periodRatings.forEach(r => {
      if (!r.timestamp) return;
      const date = r.timestamp.split('T')[0];
      if (!dayMap[date]) {
        dayMap[date] = { date, sum: 0, count: 0, positive: 0 };
      }
      dayMap[date].sum += r.rating || 0;
      dayMap[date].count += 1;
      if ((r.rating || 0) >= 4) {
        dayMap[date].positive += 1;
      }
    });

    return Object.keys(dayMap)
      .sort()
      .map(date => {
        const item = dayMap[date];
        const avg = parseFloat((item.sum / item.count).toFixed(1));
        const rate = Math.round((item.positive / item.count) * 100);
        return {
          date: date.slice(5), // MM-DD
          fullDate: date,
          avgRating: avg,
          satisfactionRate: rate,
          count: item.count
        };
      });
  }, [periodRatings]);

  // ── PDF GENERATION HANDLER ───────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      const filename = generateSatisfactionPdf({
        periodLabel,
        startDate,
        endDate,
        metrics,
        mealStats,
        lowRatedMeals,
        topMeals,
        feedbackThemes,
        recentFeedback,
        complaintsCount: periodComplaints.length,
        generatedBy: mode === 'officials' ? 'ABES Official Oversight' : 'Mess Committee Staff'
      });
      setPdfNotification(`Report downloaded: ${filename}`);
      setTimeout(() => setPdfNotification(''), 4000);
    } catch (err) {
      console.error('[PDF Generation Error]:', err);
      alert('Could not generate PDF report. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Excellent':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300';
      case 'Good':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300';
      case 'Needs Attention':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300';
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER & CONTROLS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Student Satisfaction
            </h2>
            {metrics.status !== 'No Data' && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${getStatusBadgeColor(metrics.status)}`}>
                {metrics.status}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            {mode === 'officials'
              ? 'Institutional Dining Experience • Aggregate Student Sentiment & Reporting'
              : 'Student feedback & meal experience insights for daily mess management'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            {[
              { id: 'today', label: 'Today' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' },
              { id: 'custom', label: 'Custom' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setPeriodFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  periodFilter === tab.id
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Row */}
      {periodFilter === 'custom' && (
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="text-slate-600 dark:text-slate-400">From:</span>
          <input
            type="date"
            value={customStart}
            onChange={e => setCustomStart(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-white font-medium outline-none focus:border-emerald-500"
          />
          <span className="text-slate-600 dark:text-slate-400">To:</span>
          <input
            type="date"
            value={customEnd}
            onChange={e => setCustomEnd(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-white font-medium outline-none focus:border-emerald-500"
          />
        </div>
      )}

      {/* PDF Success Toast */}
      {pdfNotification && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{pdfNotification}</span>
        </div>
      )}

      {/* ── OFFICIALS EXECUTIVE SUMMARY BANNER ── */}
      {mode === 'officials' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-transparent border border-emerald-200 dark:border-emerald-900/60 flex items-start space-x-3">
          <HelpCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">
              Student satisfaction is based on authentic meal ratings and submitted feedback collected through MessMates.
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Institutional benchmark: <strong>75% or higher</strong> represents satisfactory hostel dining operations. Scores under 50% require immediate intervention.
            </p>
          </div>
        </div>
      )}

      {/* ── METRICS GRID ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Metric 1: Satisfaction Rate */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Satisfaction Rate
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.satisfactionRate !== null ? `${metrics.satisfactionRate}%` : '—'}
          </div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Based on 4★ & 5★ ratings
          </p>
        </div>

        {/* Metric 2: Average Rating */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Average Rating
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-1">
            <span>{metrics.avgRating !== null ? metrics.avgRating : '—'}</span>
            {metrics.avgRating !== null && <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />}
          </div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {metrics.totalRatings > 0 ? `Across ${metrics.totalRatings} ratings` : 'No ratings recorded'}
          </p>
        </div>

        {/* Metric 3: Positive vs Low Ratings */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Positive Ratings
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.positiveRatings}
          </div>
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {metrics.lowRatings} low rating{metrics.lowRatings === 1 ? '' : 's'} (≤ 2★)
          </p>
        </div>

        {/* Metric 4: Feedback Received */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Feedback Notes
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.feedbackCount}
          </div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Detailed comments
          </p>
        </div>

        {/* Metric 5: Complaints Raised */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Complaints Raised
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {periodComplaints.length}
          </div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            In selected period
          </p>
        </div>
      </div>

      {/* ── MEAL-WISE SATISFACTION ── */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
              Meal-Wise Satisfaction
            </h3>
            <p className="text-xs text-slate-500 font-medium">Breakdown by meal window for {periodLabel.toLowerCase()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {mealStats.map(meal => (
            <div
              key={meal.category}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-800/30"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">
                  {meal.category}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {meal.totalRatings} rating{meal.totalRatings === 1 ? '' : 's'}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={meal.name}>
                  {meal.name}
                </p>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {meal.avgRating !== null ? meal.avgRating : '—'}
                  </span>
                  {meal.avgRating !== null && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                </div>
                <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {meal.satisfactionRate !== null ? `${meal.satisfactionRate}% satisfied` : 'No data'}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${meal.satisfactionRate || 0}%` }}
                />
              </div>

              <div className="text-[10px] text-slate-400 font-medium pt-0.5">
                {meal.feedbackCount} written comment{meal.feedbackCount === 1 ? '' : 's'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DISH PERFORMANCE: HIGHLIGHTS & AREAS NEEDING ATTENTION ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Areas Needing Attention */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
              Needs Attention (Lowest-Rated Meals)
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium">Dishes with lowest average feedback in this period</p>

          {lowRatedMeals.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center font-medium">Not enough ratings to highlight low-performing meals.</p>
          ) : (
            <div className="space-y-2">
              {lowRatedMeals.map((dish, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/5 border border-amber-200/60 dark:border-amber-900/40">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{dish.name}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{dish.category} • {dish.count} rating{dish.count === 1 ? '' : 's'}</span>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-xs font-black text-amber-600">
                    <span>{dish.avgRating}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Performing Dishes */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
              Top-Performing Dishes
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium">Highest rated meals by student appreciation</p>

          {topMeals.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center font-medium">Not enough ratings to calculate top dishes.</p>
          ) : (
            <div className="space-y-2">
              {topMeals.map((dish, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-200/60 dark:border-emerald-900/40">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{dish.name}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{dish.category} • {dish.count} rating{dish.count === 1 ? '' : 's'}</span>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-xs font-black text-emerald-600">
                    <span>{dish.avgRating}</span>
                    <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── TREND & RECURRING FEEDBACK THEMES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend Graph (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                Student Satisfaction Trend
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">Daily Satisfaction Rate (%)</span>
          </div>

          {trendData.length < 2 ? (
            <div className="h-44 flex items-center justify-center text-xs text-slate-400 font-medium">
              Not enough data to display a trend.
            </div>
          ) : (
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="satGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Satisfaction Rate']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="satisfactionRate" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#satGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recurring Feedback Themes (1 col) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
            Recurring Feedback Themes
          </h3>
          <p className="text-xs text-slate-500 font-medium">Structured mention counts from student reviews</p>

          <div className="space-y-2 pt-1">
            {feedbackThemes.slice(0, 5).map(theme => (
              <div key={theme.name} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{theme.name}</span>
                <span className="font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {theme.count} mention{theme.count === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RECENT STUDENT FEEDBACK (PRIVACY-SAFE) ── */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
              Recent Student Feedback (Privacy-Safe)
            </h3>
            <p className="text-xs text-slate-500 font-medium">Authentic feedback quotes without personally identifying information</p>
          </div>
        </div>

        {recentFeedback.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center font-medium">No student feedback comments in this period.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentFeedback.map(fb => (
              <div
                key={fb.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-800/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3 h-3 ${idx < fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{fb.date}</span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                  "{fb.comment}"
                </p>

                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold">{fb.mealName}</span>
                  <span className="font-medium text-slate-400">Anonymous Student</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── COMMITTEE ACTION SHORTCUTS (Committee mode only) ── */}
      {mode === 'committee' && onNavigate && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-white">Areas Needing Immediate Attention?</span>
            <p className="text-slate-500 font-medium">Use existing oversight workflows to take corrective action.</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('complaints')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              View Complaints
            </button>
            <button
              onClick={() => onNavigate('ratings')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              View Ratings
            </button>
            <button
              onClick={() => onNavigate('hygiene')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              View Hygiene
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
