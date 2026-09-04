import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, EmptyState, DashboardCard, SectionHeader, Modal, RatingStars } from '../components/ui';
import { MessageSquare, Plus, CheckCircle2, Clock, Star, Lock, Send, Phone } from 'lucide-react';
import { clsx } from 'clsx';
import { formatRatingRelativeTime, formatCollegeDateTime } from '../utils/dateTime';
import { OfficialContactSection } from '../components/OfficialContactSection';

export const ActivityPage = () => {
  const { 
    allComplaints, 
    userComplaints, 
    createComplaint, 
    updateComplaintStatus,
    allRatings,
    userRatings,
    currentUser,
    setCurrentPage
  } = useApp();
  const { role, user } = useAuth();

  const isStaff = ['warden', 'committee', 'mess_committee'].includes(role);
  const currentUid = user?.uid || currentUser?.uid || currentUser?.id;

  // For students, default Tab 1 is 'ratings' (Your Ratings). For staff, default is 'complaints'.
  const [activeTab, setActiveTab] = useState(isStaff ? 'complaints' : 'ratings');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [category, setCategory] = useState('Food Quality');
  const [issueText, setIssueText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Student personal rating history
  const myRatings = (userRatings && userRatings.length > 0)
    ? userRatings
    : (allRatings || []).filter(r => r.userId === currentUid);

  const displayedRatings = isStaff ? (allRatings || []) : myRatings;
  const displayedComplaints = isStaff ? (allComplaints || []) : (userComplaints || []);

  const categories = ['Food Quality', 'Hygiene', 'Taste', 'Quantity', 'Service', 'Cleanliness', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issueText.trim() || submitting) return;
    try {
      setSubmitting(true);
      await createComplaint(category, issueText.trim());
      setIssueText('');
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error creating complaint:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatComplaintDate = (dateString) => {
    try {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {isStaff ? "Complaints & Student Ratings" : "Activity & Feedback"}
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {isStaff 
              ? "Oversee student meal satisfaction, review feedback, and resolve grievances"
              : "Review your meal rating history, track complaints, and reach campus contacts"}
          </p>
        </div>

        {/* Action Button */}
        {!isStaff && activeTab === 'complaints' && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Raise a Complaint</span>
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        {!isStaff && (
          <button
            onClick={() => setActiveTab('ratings')}
            className={clsx(
              "flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer",
              activeTab === 'ratings'
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Your Ratings ({displayedRatings.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('complaints')}
          className={clsx(
            "flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer",
            activeTab === 'complaints'
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{isStaff ? "All Complaints" : "Complaints"} ({displayedComplaints.length})</span>
        </button>

        {isStaff && (
          <button
            onClick={() => setActiveTab('ratings')}
            className={clsx(
              "flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer",
              activeTab === 'ratings'
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Student Ratings ({displayedRatings.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('contacts')}
          className={clsx(
            "flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer",
            activeTab === 'contacts'
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Official Contacts</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: YOUR RATINGS (STUDENT PERSONAL RATING HISTORY) */}
      {/* ========================================================================= */}
      {activeTab === 'ratings' && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {isStaff ? "Student Ratings & Reviews" : "Your Meal Ratings"}
              </h2>
              <p className="text-xs text-slate-500">
                {isStaff
                  ? "Live feedback submitted by hostel students across daily meals"
                  : "Historical ratings are immutable and verified via your student account"}
              </p>
            </div>

            {!isStaff && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
                +1 Health Point per Review
              </span>
            )}
          </div>

          {displayedRatings.length === 0 ? (
            <EmptyState 
              icon={Star}
              title={isStaff ? "No ratings recorded yet" : "No meal ratings yet"}
              description={isStaff 
                ? "Student meal ratings will appear here as they are submitted."
                : "You haven't rated any mess meals yet. Rate your breakfast, lunch, snacks, or dinner after dining to see your personal history here!"}
              actionLabel={!isStaff ? "Go to Today's Menu" : undefined}
              onAction={!isStaff ? () => setCurrentPage('dashboard') : undefined}
            />
          ) : (
            <div className="space-y-3">
              {[...displayedRatings]
                .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
                .map((r, idx) => {
                  const relativeTimeText = formatRatingRelativeTime(r.timestamp);
                  const fullDateStr = r.timestamp ? formatCollegeDateTime(new Date(r.timestamp)) : '';

                  return (
                    <div 
                      key={r.id || idx}
                      className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 hover:border-emerald-500/30 transition-all"
                    >
                      {/* Top Row: Meal Name & Rating Stars */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {r.mealCategory && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {r.mealCategory}
                              </span>
                            )}
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                              {r.mealName || 'Mess Meal'}
                            </h3>
                          </div>
                          {isStaff && r.userName && (
                            <p className="text-[11px] text-slate-500">
                              Rated by: <strong className="text-slate-700 dark:text-slate-300">{r.userName}</strong>
                            </p>
                          )}
                        </div>

                        {/* Star Rating Badge */}
                        <div className="flex items-center space-x-2 self-start sm:self-auto">
                          <RatingStars value={Number(r.rating) || 5} readonly size="sm" />
                          <div className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-black flex items-center space-x-1">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{r.rating} ★</span>
                          </div>
                        </div>
                      </div>

                      {/* Second Row: Dynamic Contextual Relative Wording & Read-Only Distinction */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{relativeTimeText}</span>
                          {fullDateStr && (
                            <span className="text-[10px] text-slate-400 hidden sm:inline">
                              · {fullDateStr}
                            </span>
                          )}
                        </div>

                        {/* Read-only Distinction */}
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-500/20">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Recorded · Locked</span>
                        </span>
                      </div>

                      {/* Optional Review Text */}
                      {r.feedback && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 italic">
                          "{r.feedback}"
                        </div>
                      )}

                      {/* Optional Tags */}
                      {r.tags && r.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {r.tags.map((tag, i) => (
                            <span 
                              key={i} 
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPLAINTS & GRIEVANCES */}
      {/* ========================================================================= */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {isStaff ? "Grievance Management Pipeline" : "Your Complaints & Grievances"}
              </h2>
              <p className="text-xs text-slate-500">
                {isStaff 
                  ? "Track, review, and mark student complaints as resolved"
                  : "Submit mess complaints directly to administration and operations"}
              </p>
            </div>

            {!isStaff && (
              <button 
                onClick={() => setIsFormOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Raise Complaint</span>
              </button>
            )}
          </div>

          {displayedComplaints.length === 0 ? (
            <EmptyState 
              icon={CheckCircle2} 
              title={isStaff ? "No complaints recorded" : "No grievances filed"} 
              description={isStaff 
                ? "There are no complaints to review at the moment." 
                : "You have not submitted any complaints. Everything looks smooth!"} 
              actionLabel={!isStaff ? "Submit a Complaint" : undefined}
              onAction={!isStaff ? () => setIsFormOpen(true) : undefined}
            />
          ) : (
            <div className="space-y-3">
              {[...displayedComplaints]
                .sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0))
                .map(c => (
                  <div 
                    key={c.id} 
                    className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          {c.category || 'General'}
                        </span>
                        <span className="text-xs text-slate-400 font-bold flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatComplaintDate(c.createdAt || c.timestamp)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <StatusBadge status={c.status || 'PENDING'} variant="complaint" />
                      </div>
                    </div>

                    <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {c.description || c.issue || c.text}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                      <span>
                        {c.userName || c.studentName || 'Student'} • {c.block || c.hostelBlock || 'Hostel Block'}
                      </span>

                      {/* Staff Controls */}
                      {isStaff && (
                        <div className="flex items-center space-x-1.5">
                          {c.status !== 'IN REVIEW' && c.status !== 'RESOLVED' && (
                            <button
                              onClick={() => updateComplaintStatus(c.id, 'IN REVIEW')}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                            >
                              In Review
                            </button>
                          )}
                          {c.status !== 'RESOLVED' && (
                            <button
                              onClick={() => updateComplaintStatus(c.id, 'RESOLVED')}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                            >
                              Mark Resolved ✓
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: OFFICIAL CONTACTS */}
      {/* ========================================================================= */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <OfficialContactSection />
        </div>
      )}

      {/* Persistent Contacts Quick Strip at Bottom of Activity Page */}
      {activeTab !== 'contacts' && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <OfficialContactSection />
        </div>
      )}

      {/* RAISE COMPLAINT MODAL */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Raise Mess Complaint">
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">
              Select Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={clsx(
                    "px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer",
                    category === cat 
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">
              Description
            </label>
            <textarea 
              rows={4}
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              placeholder="Describe the issue in detail (e.g. food quality, undercooked dishes, timing delays)..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-shadow outline-none"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!issueText.trim() || submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Complaint'}</span>
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};
