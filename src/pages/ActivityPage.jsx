import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, EmptyState, DashboardCard, SectionHeader, Modal } from '../components/ui';
import { MessageSquare, Plus, CheckCircle2, Clock } from 'lucide-react';
import { clsx } from 'clsx';

export const ActivityPage = () => {
  const { 
    allComplaints, 
    userComplaints, 
    createComplaint, 
    updateComplaintStatus 
  } = useApp();
  const { role } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [category, setCategory] = useState('Food Quality');
  const [issueText, setIssueText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isStaff = ['warden', 'committee', 'mess_committee'].includes(role);
  const displayedComplaints = isStaff ? allComplaints : userComplaints;

  const categories = ['Food Quality', 'Hygiene', 'Service', 'Quantity', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issueText.trim() || submitting) return;
    try {
      setSubmitting(true);
      await createComplaint(category, issueText);
      setIssueText('');
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error creating complaint:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <SectionHeader 
        title="Complaints & Feedback" 
        subtitle={isStaff ? "Manage student issues" : "Track and submit your issues"}
        action={
          !isStaff && (
            <button 
              onClick={() => setIsFormOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Complaint</span>
              <span className="sm:hidden">New</span>
            </button>
          )
        }
      />

      <div className="space-y-4">
        {displayedComplaints && displayedComplaints.length > 0 ? (
          [...displayedComplaints].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(complaint => (
            <DashboardCard key={complaint.id} className="hover:border-emerald-500/30 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {complaint.category}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(complaint.createdAt)}
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                    {complaint.issue}
                  </p>
                  {isStaff && complaint.studentName && (
                    <p className="text-xs text-slate-500">Reported by: <span className="font-medium text-slate-700 dark:text-slate-300">{complaint.studentName}</span></p>
                  )}
                </div>
                
                <div className="flex flex-col items-end justify-between min-w-[120px]">
                  <StatusBadge status={complaint.status} variant="complaint" />
                  
                  {isStaff && complaint.status !== 'RESOLVED' && (
                    <div className="mt-4 flex gap-2">
                      {complaint.status === 'PENDING' && (
                        <button 
                          onClick={() => updateComplaintStatus(complaint.id, 'IN REVIEW')}
                          className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg font-medium transition-colors"
                        >
                          Review
                        </button>
                      )}
                      <button 
                        onClick={() => updateComplaintStatus(complaint.id, 'RESOLVED')}
                        className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg font-medium transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </DashboardCard>
          ))
        ) : (
          <EmptyState 
            icon={CheckCircle2} 
            title={isStaff ? "No active complaints" : "You're all clear"} 
            description={isStaff ? "There are no complaints to review at the moment." : "No complaints submitted. Everything looks good!"} 
          />
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Submit Complaint">
        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={clsx(
                    "px-4 py-2 text-sm font-medium rounded-full border transition-colors",
                    category === cat 
                      ? "bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea 
              rows={4}
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              placeholder="Describe your issue in detail..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-shadow"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={!issueText.trim() || submitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? 'Submitting...' : 'Submit Issue'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
