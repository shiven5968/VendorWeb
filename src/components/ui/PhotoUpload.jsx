import React, { useState, useRef } from 'react';
import { Upload, X, ImagePlus, Check } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * PhotoUpload — drag-and-drop photo upload component.
 */
export const PhotoUpload = ({
  onFilesSelected,
  maxFiles = 5,
  accept = 'image/*',
  disabled = false,
  existingPreviews = [],
  className = ''
}) => {
  const [previews, setPreviews] = useState(existingPreviews);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const processFiles = (files) => {
    const remaining = maxFiles - previews.length;
    const toProcess = Array.from(files).slice(0, remaining);
    const newPreviews = toProcess.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    const updated = [...previews, ...newPreviews];
    setPreviews(updated);
    onFilesSelected?.(updated.map(p => p.file));
  };

  const removePreview = (index) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onFilesSelected?.(updated.map(p => p.file));
  };

  return (
    <div className={clsx('space-y-3', className)}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={clsx(
          'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
          dragging
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
          disabled={disabled}
        />
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
            <ImagePlus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Drop photos here or <span className="text-emerald-600">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WEBP — up to 5MB each</p>
            <p className="text-xs text-slate-400">{previews.length}/{maxFiles} selected</p>
          </div>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {previews.map((preview, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={preview.url}
                alt={preview.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={(e) => { e.stopPropagation(); removePreview(i); }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
