import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { clsx } from 'clsx';
import { EmptyState } from './EmptyState';
import { Camera } from 'lucide-react';

export const PhotoGallery = ({ photos = [], groupBy = 'category', onPhotoClick, className = '' }) => {
  const [lightbox, setLightbox] = useState(null);

  if (!photos || photos.length === 0) {
    return (
      <EmptyState
        icon={Camera}
        title="No photos yet"
        description="No photos have been uploaded for this selection."
        className={className}
      />
    );
  }

  const grouped = photos.reduce((acc, photo) => {
    const key = groupBy === 'category' ? (photo.photoCategory || 'Other') :
                 groupBy === 'meal' ? (photo.mealCategory || 'General') :
                 'All Photos';
    if (!acc[key]) acc[key] = [];
    acc[key].push(photo);
    return acc;
  }, {});

  const allPhotos = photos;
  const currentIndex = lightbox !== null ? lightbox : 0;

  return (
    <div className={clsx('space-y-6', className)}>
      {Object.entries(grouped).map(([group, groupPhotos]) => (
        <div key={group}>
          <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 mb-3 uppercase tracking-wide">
            {group}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {groupPhotos.map((photo, i) => (
              <button
                key={photo.id || i}
                onClick={() => setLightbox(allPhotos.indexOf(photo))}
                className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group"
              >
                <img
                  src={photo.url || photo.downloadUrl}
                  alt={photo.photoCategory || 'Mess photo'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
          {currentIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(currentIndex - 1); }}
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <img
            src={allPhotos[currentIndex]?.url || allPhotos[currentIndex]?.downloadUrl}
            alt="Mess photo"
            className="max-w-full max-h-[85vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          {currentIndex < allPhotos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(currentIndex + 1); }}
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          <div className="absolute bottom-4 text-white/60 text-sm">{currentIndex + 1} / {allPhotos.length}</div>
        </div>
      )}
    </div>
  );
};
