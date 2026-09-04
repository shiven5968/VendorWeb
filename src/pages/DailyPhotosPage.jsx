import React, { useState } from 'react';
import { PhotoUpload, EmptyState, LoadingState, StatusBadge, DashboardCard, SectionHeader } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Camera, CheckCircle2 } from 'lucide-react';
import { getCollegeDateString } from '../utils/dateTime';

export const DailyPhotosPage = () => {
  const { currentUser, uploadMessPhoto, messPhotos } = useApp();
  
  const today = getCollegeDateString();
  const [selectedDate] = useState(today);
  const [selectedMealCategory, setSelectedMealCategory] = useState('Breakfast');
  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState('Food Preparation');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [notes, setNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [uploadStage, setUploadStage] = useState('IDLE'); // 'IDLE' | 'COMPRESSING' | 'UPLOADING' | 'SAVING_METADATA' | 'COMPLETE' | 'FAILED'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const mealCategories = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
  const photoCategories = ['Food Preparation', 'Serving', 'Hygiene', 'Dining Area', 'Other'];

  const todayPhotos = (messPhotos || []).filter(p => p.date === selectedDate);

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one photo.');
      return;
    }
    setError('');
    setSubmitting(true);
    setUploadStage('COMPRESSING');
    setUploadProgress(0);
    
    try {
      await uploadMessPhoto(
        { date: selectedDate, mealCategory: selectedMealCategory, photoCategory: selectedPhotoCategory, notes },
        selectedFiles,
        (progressInfo) => {
          if (progressInfo.stage) setUploadStage(progressInfo.stage);
          if (typeof progressInfo.progress === 'number') setUploadProgress(progressInfo.progress);
        }
      );
      setUploadStage('COMPLETE');
      setSubmitted(true);
      setSelectedFiles([]);
      setNotes('');
      setTimeout(() => {
        setSubmitted(false);
        setUploadStage('IDLE');
        setUploadProgress(0);
      }, 3000);
    } catch (err) {
      setUploadStage('FAILED');
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
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Date</label>
            <input type="text" readOnly value={selectedDate} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-2.5 text-xs text-slate-600 dark:text-slate-300 font-bold cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Meal Category</label>
            <div className="flex flex-wrap gap-2">
              {mealCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedMealCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${selectedMealCategory === cat ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Photo Category</label>
            <div className="flex flex-wrap gap-2">
              {photoCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedPhotoCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${selectedPhotoCategory === cat ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add any operational notes..."
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none min-h-[72px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Photos (Max 5)</label>
            <PhotoUpload maxFiles={5} onFilesSelected={setSelectedFiles} disabled={submitting} />
            
            {/* Live Progress Bar */}
            {submitting && uploadStage === 'UPLOADING' && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span>Uploading to Cloud Storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start space-x-2">
                <span className="font-bold">Error:</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || selectedFiles.length === 0}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${submitting ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : submitted ? 'bg-emerald-600 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
          >
            {submitting ? (
              <span>
                {uploadStage === 'COMPRESSING' ? 'Compressing image...' :
                 uploadStage === 'UPLOADING' ? `Uploading... ${uploadProgress}%` :
                 uploadStage === 'SAVING_METADATA' ? 'Saving photo details...' :
                 'Processing...'}
              </span>
            ) : submitted ? (
              <><CheckCircle2 className="w-4 h-4" /><span>Published!</span></>
            ) : (
              <><Camera className="w-4 h-4" /><span>Upload &amp; Publish Photos</span></>
            )}
          </button>
        </div>
      </DashboardCard>

      <DashboardCard title="Today's Submissions">
        {todayPhotos.length === 0 ? (
          <EmptyState icon={Camera} title="No photos uploaded today" description="Operational photos uploaded today will appear here." />
        ) : (
          <div className="space-y-3">
            {todayPhotos.map((sub, i) => (
              <div key={sub.id || i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-300">{sub.mealCategory}</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{sub.photoCategory}</span>
                  </div>
                  <StatusBadge status="published" variant="photo" />
                </div>
                {sub.notes && <p className="text-xs text-slate-500 italic">"{sub.notes}"</p>}
                {sub.urls && sub.urls.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pt-1">
                    {sub.urls.map((url, idx) => (
                      <img key={idx} src={url} alt="sub" className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
};
