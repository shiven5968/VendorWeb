import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Utensils, Save, UploadCloud, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { uploadMealImage, validateMealImage } from '../services/storage';

export const AddEditMealModal = () => {
  const { isAddMealModalOpen, setIsAddMealModalOpen, editingMeal, setEditingMeal, saveMeal, selectedDay } = useApp();

  const fileInputRef = useRef(null);
  const previewBlobUrlRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Breakfast',
    targetDay: selectedDay || 'Monday',
    calories: 400,
    protein: 20,
    carbs: 50,
    fats: 12,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
    ingredientsStr: 'Paneer, Wheat Flour, Spices',
    items: 'Veg Dish + Roti + Rice + Curd',
    gymRecommended: true,
    description: 'Freshly prepared nutritious hostel meal.',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [statusText, setStatusText] = useState('');

  // Memory cleanup for object URLs
  const cleanupPreviewUrl = () => {
    if (previewBlobUrlRef.current) {
      try {
        URL.revokeObjectURL(previewBlobUrlRef.current);
      } catch (e) {}
      previewBlobUrlRef.current = null;
    }
  };

  useEffect(() => {
    cleanupPreviewUrl();
    if (editingMeal) {
      setFormData({
        id: editingMeal.id,
        name: editingMeal.name || '',
        category: editingMeal.category || 'Breakfast',
        targetDay: editingMeal.day || selectedDay || 'Monday',
        calories: editingMeal.calories || 400,
        protein: editingMeal.protein || 20,
        carbs: editingMeal.carbs || 50,
        fats: editingMeal.fats || 12,
        image: editingMeal.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
        ingredientsStr: editingMeal.ingredients ? editingMeal.ingredients.join(', ') : '',
        items: editingMeal.items || editingMeal.description || '',
        gymRecommended: editingMeal.gymRecommended || false,
        description: editingMeal.description || '',
      });
      setImagePreview(editingMeal.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800');
    } else {
      setFormData({
        name: '',
        category: 'Breakfast',
        targetDay: selectedDay || 'Monday',
        calories: 400,
        protein: 20,
        carbs: 50,
        fats: 12,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
        ingredientsStr: 'Paneer, Wheat Flour, Spices',
        items: 'Veg Dish + Roti + Rice + Curd',
        gymRecommended: true,
        description: 'Nutritious chef prepared dish.',
      });
      setImagePreview('https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800');
    }

    setSelectedFile(null);
    setIsUploadingImage(false);
    setIsSaving(false);
    setUploadSuccess(false);
    setImageUploadError('');
    setSaveError('');
    setStatusText('');

    return () => cleanupPreviewUrl();
  }, [editingMeal, isAddMealModalOpen, selectedDay]);

  if (!isAddMealModalOpen) return null;

  // Handle local file selection with immediate validation & local preview
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadError('');
    setSaveError('');
    setUploadSuccess(false);

    try {
      // Validate file type (JPG, PNG, WEBP) & max size (5 MB)
      validateMealImage(file);
      setSelectedFile(file);

      // Clean up previous blob URL
      cleanupPreviewUrl();

      // Create instant local blob preview
      const localBlobUrl = URL.createObjectURL(file);
      previewBlobUrlRef.current = localBlobUrl;
      setImagePreview(localBlobUrl);
    } catch (err) {
      setSelectedFile(null);
      setImageUploadError(err.message || 'Please choose a JPG, PNG, or WEBP image under 5 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetSelectedFile = () => {
    cleanupPreviewUrl();
    setSelectedFile(null);
    setImagePreview(formData.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800');
    setImageUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Form Submission with Strict State Transitions & Timeout Protection:
  // idle -> uploading (if file) -> saving -> success | error
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploadingImage || isSaving) return;

    setSaveError('');
    setImageUploadError('');
    setUploadSuccess(false);

    let finalImageUrl = formData.image;
    const mealId = editingMeal?.id || `meal_${Date.now()}`;

    try {
      // STEP 1: If a real local image file is selected, upload to Firebase Storage
      if (selectedFile) {
        setIsUploadingImage(true);
        setStatusText('UPLOADING...');
        
        const uploadResult = await uploadMealImage(selectedFile, mealId);
        if (!uploadResult || !uploadResult.downloadUrl) {
          throw new Error('Image upload failed: No download URL received.');
        }
        finalImageUrl = uploadResult.downloadUrl;
        setFormData(prev => ({ ...prev, image: finalImageUrl }));
      }

      // STEP 2: Save updated meal with download URL to Firestore
      setIsUploadingImage(false);
      setIsSaving(true);
      setStatusText('SAVING...');

      const finalMeal = {
        ...formData,
        id: mealId,
        image: finalImageUrl,
        calories: Number(formData.calories) || 0,
        protein: Number(formData.protein) || 0,
        carbs: Number(formData.carbs) || 0,
        fats: Number(formData.fats) || 0,
        ingredients: typeof formData.ingredientsStr === 'string'
          ? formData.ingredientsStr.split(',').map(s => s.trim()).filter(Boolean)
          : (formData.ingredients || []),
      };

      // Atomic write to Firestore
      await saveMeal(finalMeal, formData.targetDay);

      setUploadSuccess(true);
      setStatusText('');
      cleanupPreviewUrl();

      // Brief confirmation before closing
      setTimeout(() => {
        setIsAddMealModalOpen(false);
        setEditingMeal(null);
      }, 400);
    } catch (err) {
      console.error('[Meal Form Error]:', err);
      const errMsg = err.message || 'Operation failed. Please check your connection and try again.';
      setSaveError(errMsg);
      setImageUploadError(errMsg);
    } finally {
      setIsUploadingImage(false);
      setIsSaving(false);
      setStatusText('');
    }
  };

  const isBusy = isUploadingImage || isSaving;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {editingMeal ? 'Edit Mess Menu Item' : 'Upload New Mess Item'}
              </h3>
              <p className="text-xs text-slate-500 font-semibold">ABES Mess Committee Management Studio</p>
            </div>
          </div>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => { setIsAddMealModalOpen(false); setEditingMeal(null); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-40 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Save Error Banner */}
        {saveError && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 border border-rose-500/30">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Day</label>
              <select
                disabled={isBusy}
                value={formData.targetDay}
                onChange={e => setFormData({ ...formData, targetDay: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none disabled:opacity-50"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dish Name</label>
              <input
                type="text"
                required
                disabled={isBusy}
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Matar Paneer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none font-semibold disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                disabled={isBusy}
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none disabled:opacity-50"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Snacks">Snacks</option>
                <option value="Dinner">Dinner</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Combo Items Served (Notice Board Menu)</label>
            <input
              type="text"
              required
              disabled={isBusy}
              value={formData.items}
              onChange={e => setFormData({ ...formData, items: e.target.value })}
              placeholder="e.g. Aloo Paratha + Tea + Curd + Fruit + Achar"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none font-semibold disabled:opacity-50"
            />
          </div>

          {/* Macros Grid */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Calories</label>
              <input
                type="number"
                disabled={isBusy}
                value={formData.calories}
                onChange={e => setFormData({ ...formData, calories: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-emerald-500 uppercase">Protein (g)</label>
              <input
                type="number"
                disabled={isBusy}
                value={formData.protein}
                onChange={e => setFormData({ ...formData, protein: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-50/50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Carbs (g)</label>
              <input
                type="number"
                disabled={isBusy}
                value={formData.carbs}
                onChange={e => setFormData({ ...formData, carbs: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Fats (g)</label>
              <input
                type="number"
                disabled={isBusy}
                value={formData.fats}
                onChange={e => setFormData({ ...formData, fats: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold disabled:opacity-50"
              />
            </div>
          </div>

          {/* REAL MEAL IMAGE UPLOAD & PREVIEW SECTION */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Meal Photograph
              </label>
              <span className="text-[10px] font-semibold text-slate-400">
                Max 5 MB • JPG, PNG, WEBP
              </span>
            </div>

            {/* Hidden File Input triggering native file manager */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={isBusy}
              className="hidden"
            />

            {/* Image Preview & Upload Triggers */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-32 h-24 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shrink-0 shadow-sm">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Meal Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}

                {isUploadingImage && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-1">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Uploading...</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-600 flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{selectedFile ? 'Change Photo' : 'Choose Photo'}</span>
                  </button>

                  {selectedFile && !isBusy && (
                    <button
                      type="button"
                      onClick={handleResetSelectedFile}
                      title="Reset selected photo"
                      className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-white dark:bg-slate-900 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Selected File Details */}
                {selectedFile && (
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                    <span className="font-bold block truncate">Selected: {selectedFile.name}</span>
                    <span className="text-[10px] opacity-80">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload on save</span>
                  </div>
                )}

                {imageUploadError && (
                  <p className="text-[11px] text-rose-500 font-bold flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{imageUploadError}</span>
                  </p>
                )}

                {uploadSuccess && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Meal image updated successfully.</span>
                  </p>
                )}
              </div>
            </div>

            {/* Direct Image URL input */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Image URL</label>
              <input
                type="text"
                disabled={isBusy}
                value={formData.image}
                onChange={e => {
                  setFormData({ ...formData, image: e.target.value });
                  if (!selectedFile) setImagePreview(e.target.value);
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none font-mono disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ingredients (comma separated)</label>
            <input
              type="text"
              disabled={isBusy}
              value={formData.ingredientsStr}
              onChange={e => setFormData({ ...formData, ingredientsStr: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none disabled:opacity-50"
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 shrink-0">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => { setIsAddMealModalOpen(false); setEditingMeal(null); }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBusy}
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{statusText || 'SAVING...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{editingMeal ? 'Update Menu Item' : 'Publish to Weekly Menu'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
