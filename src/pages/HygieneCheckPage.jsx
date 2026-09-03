import React, { useState } from 'react';
import { EmptyState, LoadingState, StatusBadge, DashboardCard, SectionHeader } from '../components/ui';
import { useApp } from '../context/AppContext';
import { ClipboardCheck, CheckCircle2 } from 'lucide-react';

export const HygieneCheckPage = () => {
  const { currentUser, submitHygieneCheck, hygieneChecks } = useApp();
  
  const today = new Date().toISOString().split('T')[0];
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');

  const todaySubmissions = (hygieneChecks || []).filter(h => h.date === today);

  const checklistItems = [
    'Kitchen cleanliness',
    'Cooking area cleanliness',
    'Dining area cleanliness',
    'Serving area cleanliness',
    'Waste disposal',
    'Food handling practices',
    'General hygiene standards'
  ];

  const [items, setItems] = useState(
    checklistItems.map(label => ({ label, status: '', comment: '' }))
  );

  const handleStatusChange = (index, status) => {
    const newItems = [...items];
    newItems[index].status = status;
    setItems(newItems);
  };

  const handleCommentChange = (index, comment) => {
    const newItems = [...items];
    newItems[index].comment = comment;
    setItems(newItems);
  };

  const calculateOverallStatus = () => {
    const statuses = items.map(i => i.status);
    if (statuses.includes('Critical')) return 'Critical';
    if (statuses.includes('Needs Attention')) return 'Needs Attention';
    if (statuses.every(s => s === 'Good')) return 'Good';
    return 'Pending';
  };

  const handleSubmit = async () => {
    if (items.some(i => !i.status)) {
      setError('Please select a status for all items.');
      return;
    }
    setError('');
    setSubmitting(true);
    
    try {
      const overallStatus = calculateOverallStatus();
      await submitHygieneCheck({
        date: today,
        items,
        overallStatus,
        notes: generalNotes
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setItems(checklistItems.map(label => ({ label, status: '', comment: '' })));
        setGeneralNotes('');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Failed to submit inspection.');
    } finally {
      setSubmitting(false);
    }
  };

  const overallStatus = calculateOverallStatus();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <SectionHeader title="Hygiene Inspection" subtitle="Daily hygiene compliance checklist" />
      
      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">Date: {today}</div>

      <DashboardCard title="Inspection Checklist">
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
              <p className="font-bold text-sm mb-2">{item.label}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {['Good', 'Needs Attention', 'Critical'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(index, status)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      item.status === status
                        ? status === 'Good' ? 'bg-emerald-600 text-white' : status === 'Needs Attention' ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Optional comment..."
                value={item.comment}
                onChange={(e) => handleCommentChange(index, e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          ))}
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
      </DashboardCard>

      <DashboardCard title="Summary">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <span className="font-bold text-sm">Overall Status</span>
            <StatusBadge 
              status={overallStatus} 
              variant={overallStatus === 'Good' ? 'success' : overallStatus === 'Critical' ? 'danger' : overallStatus === 'Needs Attention' ? 'warning' : 'default'} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">General Notes</label>
            <textarea
              value={generalNotes}
              onChange={e => setGeneralNotes(e.target.value)}
              placeholder="Add any general observations..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
            />
          </div>

          <button onClick={handleSubmit} disabled={submitting} className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${submitting ? 'bg-slate-200 text-slate-500' : submitted ? 'bg-emerald-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500'}`}>
            {submitting ? <LoadingState type="spinner" /> : submitted ? <><CheckCircle2 className="w-5 h-5" /><span>Submitted!</span></> : <><ClipboardCheck className="w-5 h-5" /><span>Submit Inspection Report</span></>}
          </button>
        </div>
      </DashboardCard>

      <DashboardCard title="Today's Submissions">
        {todaySubmissions.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title="No inspections today" description="Submit an inspection report to see it here." />
        ) : (
          <div className="space-y-3">
            {todaySubmissions.map((sub, i) => (
              <div key={sub.id || i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Inspection at {sub.timestamp?.toDate ? sub.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-xs text-slate-500">By {sub.submittedByName || sub.submittedBy}</p>
                </div>
                <StatusBadge 
                  status={sub.overallStatus} 
                  variant="hygiene"
                />
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
};
