import React, { useState, useEffect } from 'react';
import { PhotoGallery, EmptyState, LoadingState, DashboardCard, SectionHeader } from '../components/ui';
import { getMessPhotos } from '../services/messOperations';
import { useApp } from '../context/AppContext';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export const PhotoArchivePage = () => {
  const { messPhotos } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If context already has live photos for this date, use them immediately
    const contextPhotos = (messPhotos || []).filter(p => p.date === selectedDate);
    if (contextPhotos.length > 0) {
      setPhotos(contextPhotos);
      return;
    }

    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const fetched = await getMessPhotos(selectedDate);
        setPhotos(fetched);
      } catch (err) {
        console.error('Failed to fetch photos', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, [selectedDate, messPhotos]);

  const changeDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  // Convert array of photo docs to format expected by PhotoGallery
  const galleryPhotos = (photos || []).flatMap(doc => {
    const urls = Array.isArray(doc.urls) ? doc.urls : (doc.url ? [doc.url] : (doc.downloadUrl ? [doc.downloadUrl] : []));
    return urls.map(url => ({
      url,
      category: doc.photoCategory || 'Mess Photo',
      meal: doc.mealCategory || 'General',
      uploadedBy: doc.uploadedByName || 'Mess Committee',
      timestamp: doc.timestamp?.toDate ? doc.timestamp.toDate() : new Date()
    }));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <SectionHeader title="Mess Photo Archive" subtitle="Browse daily operational photos" />
      
      <DashboardCard>
        <div className="flex items-center justify-between mb-6 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
          <div className="flex items-center space-x-2 font-bold">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <span>{new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <button onClick={() => changeDate(1)} disabled={selectedDate >= new Date().toISOString().split('T')[0]} className={`p-2 rounded-lg ${selectedDate >= new Date().toISOString().split('T')[0] ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-slate-700'}`}><ChevronRight className="w-5 h-5" /></button>
        </div>

        {loading ? (
          <div className="py-12"><LoadingState type="spinner" /></div>
        ) : galleryPhotos.length > 0 ? (
          <PhotoGallery photos={galleryPhotos} groupBy="meal" />
        ) : (
          <EmptyState icon={Calendar} title="No photos found" description={`No photos were uploaded on ${selectedDate}.`} />
        )}
      </DashboardCard>
    </div>
  );
};
