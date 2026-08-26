import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, Plus, Send, CheckCircle2, Clock, AlertCircle, Star } from 'lucide-react';

export const ActivityPage = () => {
  const { currentUser, recentComplaints, userRatings, meals } = useApp();

  const [activeTab, setActiveTab] = useState('complaints');
  const [complaintList, setComplaintList] = useState(recentComplaints || []);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('Quality');
  const [issueText, setIssueText] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!issueText.trim()) return;

    const newComplaint = {
      id: 'c_' + Date.now(),
      student: currentUser?.name || 'Parth Sharma',
      block: currentUser?.hostelBlock || 'DNB Block',
      issue: `[${category}] ${issueText}`,
      status: 'Pending',
      date: 'Just now'
    };

    setComplaintList([newComplaint, ...complaintList]);
    setIssueText('');
    setShowForm(false);
    setSubmittedNotice(true);
    setTimeout(() => setSubmittedNotice(false), 2500);
  };

  const getStatusBadge = (status) => {
    if (status === 'Resolved') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
          Resolved
        </span>
      );
    } else if (status === 'In Review' || status === 'In Progress') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
          In Review
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20">
        Pending
      </span>
    );
  };

  const ratedMeals = meals.filter(m => userRatings[m.id]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Activity</h1>
          <p className="text-xs text-slate-500 font-semibold">Complaints & Rating Feedback</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>New Complaint</span>
        </button>
      </div>

      {submittedNotice && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold text-center border border-emerald-500/30">
          Complaint submitted. Status: Pending.
        </div>
      )}

      {/* New Complaint Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-md">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Report Issue</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              >
                <option value="Taste">Taste</option>
                <option value="Quality">Quality</option>
                <option value="Quantity">Quantity</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Menu">Menu</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
              <input
                type="text"
                required
                value={issueText}
                onChange={e => setIssueText(e.target.value)}
                placeholder="Describe the issue..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md flex items-center space-x-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('complaints')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'complaints'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-500'
          }`}
        >
          Complaints ({complaintList.length})
        </button>

        <button
          onClick={() => setActiveTab('ratings')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'ratings'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-500'
          }`}
        >
          My Ratings ({ratedMeals.length})
        </button>
      </div>

      {/* Complaints List */}
      {activeTab === 'complaints' && (
        <div className="space-y-3">
          {complaintList.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              No complaints yet.
            </div>
          ) : (
            complaintList.map(c => (
              <div key={c.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">{c.issue}</h4>
                  <span className="text-[10px] text-slate-400">{c.date} • {c.block}</span>
                </div>
                <div>{getStatusBadge(c.status)}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Ratings List */}
      {activeTab === 'ratings' && (
        <div className="space-y-3">
          {ratedMeals.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              No feedback yet.
            </div>
          ) : (
            ratedMeals.map(m => (
              <div key={m.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">{m.name}</h4>
                  <span className="text-[10px] text-slate-400">{m.category}</span>
                </div>
                <div className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-black flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{userRatings[m.id]} Stars</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
