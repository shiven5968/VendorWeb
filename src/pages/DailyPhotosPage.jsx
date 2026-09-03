import React, { useState } from 'react';
import { PhotoUpload, EmptyState, LoadingState, StatusBadge, DashboardCard, SectionHeader } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Camera, CheckCircle2 } from 'lucide-react';

export const DailyPhotosPage = () => {
  const { currentUser, uploadMessPhoto, todayDay } = useApp();
  
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate] = useState(today);
  const [selectedMealCategory, setSelectedMealCategory] = useState('Breakfast');
  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState('Food Preparation');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [notes, setNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');

  const mealCategories = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
  const photoCategories = ['Food Preparation', 'Serving', 'Hygiene', 'Dining Area', 'Other'];

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one photo.');
      return;
    }
    setError('');
    setSubmitting(true);
    
    try {
      const result = await uploadMessPhoto(
        { date: selectedDate, mealCategory: selectedMealCategory, photoCategory: selectedPhotoCategory, notes },
        selectedFiles
      );
      if (result) {
        setSubmissions(prev => [result, ...prev]);
        setSubmitted(true);
        setSelectedFiles([]);
        setNotes('');
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload photos.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <SectionHeader title="Daily Mess Photos" subtitle="Upload operational photos for mess transparency" />
      
      <DashboardCard title="Upload Photos">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
            <input type="text" readOnly value={selectedDate} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg p-2 text-sm text-slate-500 cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Meal Category</label>
            <div className="flex flex-wrap gap-2">
              {mealCategories.map(cat => (
                <button key={cat} onClick={() => setSelectedMealCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-semibold ${selectedMealCategory === cat ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{cat}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Photo Category</label>
            <div className="flex flex-wrap gap-2">
              {photoCategories.map(cat => (
                <button key={cat} onClick={() => setSelectedPhotoCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-semibold ${selectedPhotoCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{cat}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any operational notes..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 min-h-[80px]" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Photos (Max 5)</label>
            <PhotoUpload maxFiles={5} onFilesSelected={setSelectedFiles} disabled={submitting} />
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>

          <button onClick={handleSubmit} disabled={submitting || selectedFiles.length === 0} className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${submitting ? 'bg-slate-200 text-slate-500' : submitted ? 'bg-emerald-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500'}`}>
            {submitting ? <LoadingState type="spinner" /> : submitted ? <><CheckCircle2 className="w-5 h-5" /><span>Published!</span></> : <><Camera className="w-5 h-5" /><span>Upload & Publish Photos</span></>}
          </button>
        </div>
      </DashboardCard>

      <DashboardCard title="Today's Submissions">
        {submissions.length === 0 ? (
          <EmptyState icon={Camera} title="No photos uploaded today" description="Start by uploading your first batch." />
        ) : (
          <div className="space-y-3">
            {submissions.map((sub, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">{sub.mealCategory}</span>
                    <span className="text-sm font-medium">{sub.photoCategory}</span>
                  </div>
                  <p className="text-xs text-slate-500">{sub.urls.length} photos uploaded</p>
                </div>
                <StatusBadge status="published" variant="success" />
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
};
