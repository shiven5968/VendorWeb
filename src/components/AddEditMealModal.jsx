import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Utensils, Save, Sparkles, UploadCloud, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadMealImage, validateMealImage } from '../services/storage';

export const AddEditMealModal = () => {
  const { isAddMealModalOpen, setIsAddMealModalOpen, editingMeal, setEditingMeal, saveMeal, selectedDay } = useApp();

  const fileInputRef = useRef(null);

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
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
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
      setImagePreview(editingMeal.image || null);
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
    setUploadSuccess(false);
    setImageUploadError('');
    setIsSaving(false);
    setSaveError('');
  }, [editingMeal, isAddMealModalOpen, selectedDay]);

  if (!isAddMealModalOpen) return null;

  // Handle local file selection with preview & validation
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadError('');
    setUploadSuccess(false);

    try {
      validateMealImage(file);
      setSelectedFile(file);

      // Create instant local blob preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Automatically initiate Firebase Storage upload
      setIsUploadingImage(true);
      const mealId = editingMeal?.id || `meal_${Date.now()}`;
      const uploadResult = await uploadMealImage(file, mealId);

      if (uploadResult?.downloadUrl) {
        setFormData(prev => ({ ...prev, image: uploadResult.downloadUrl }));
        setImagePreview(uploadResult.downloadUrl);
        setUploadSuccess(true);
      }
    } catch (err) {
      console.error('[Image Upload Error]:', err);
      setImageUploadError(err.message || 'Image upload failed.');
      // Revert preview to previous image
      setImagePreview(formData.image);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploadingImage || isSaving) return;

    setSaveError('');
    setIsSaving(true);

    try {
      const finalMeal = {
        ...formData,
        calories: Number(formData.calories) || 0,
        protein: Number(formData.protein) || 0,
        carbs: Number(formData.carbs) || 0,
        fats: Number(formData.fats) || 0,
        ingredients: formData.ingredientsStr.split(',').map(s => s.trim()).filter(Boolean),
      };

      // Await database/Firestore write before closing modal or showing success
      await saveMeal(finalMeal, formData.targetDay);
      
      setIsAddMealModalOpen(false);
      setEditingMeal(null);
    } catch (err) {
      console.error('[Meal Save Error]:', err);
      setSaveError(err.message || 'Failed to save meal to database.');
    } finally {
      setIsSaving(false);
    }
  };

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
            onClick={() => { setIsAddMealModalOpen(false); setEditingMeal(null); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banners */}
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
                value={formData.targetDay}
                onChange={e => setFormData({ ...formData, targetDay: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
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
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Matar Paneer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
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
              value={formData.items}
              onChange={e => setFormData({ ...formData, items: e.target.value })}
              placeholder="e.g. Aloo Paratha + Tea + Curd + Fruit + Achar"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none font-semibold"
            />
          </div>

          {/* Macros Grid */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Calories</label>
              <input
                type="number"
                value={formData.calories}
                onChange={e => setFormData({ ...formData, calories: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-emerald-500 uppercase">Protein (g)</label>
              <input
                type="number"
                value={formData.protein}
                onChange={e => setFormData({ ...formData, protein: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-50/50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Carbs (g)</label>
              <input
                type="number"
                value={formData.carbs}
                onChange={e => setFormData({ ...formData, carbs: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Fats (g)</label>
              <input
                type="number"
                value={formData.fats}
                onChange={e => setFormData({ ...formData, fats: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
              />
            </div>
          </div>

          {/* REAL IMAGE UPLOAD & PREVIEW SECTION */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Meal Photograph
              </label>
              <span className="text-[10px] font-semibold text-slate-400">
                Max 5 MB • JPG, PNG, WEBP
              </span>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Image Preview & Upload Triggers */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-28 h-24 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shrink-0 shadow-sm">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}

                {isUploadingImage && (
                  <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-1">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                    <span className="text-[9px] font-bold">Uploading...</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 w-full">
                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-600 flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{selectedFile ? 'Replace Photo' : 'Upload Real Dish Photo'}</span>
                </button>

                {uploadSuccess && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Photo uploaded to Firebase Storage successfully!</span>
                  </p>
                )}

                {imageUploadError && (
                  <p className="text-[11px] text-rose-500 font-bold flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{imageUploadError}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Direct Image URL input for advanced use */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Image URL</label>
              <input
                type="text"
                value={formData.image}
                onChange={e => {
                  setFormData({ ...formData, image: e.target.value });
                  setImagePreview(e.target.value);
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ingredients (comma separated)</label>
            <input
              type="text"
              value={formData.ingredientsStr}
              onChange={e => setFormData({ ...formData, ingredientsStr: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 shrink-0">
            <button
              type="button"
              disabled={isSaving || isUploadingImage}
              onClick={() => { setIsAddMealModalOpen(false); setEditingMeal(null); }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploadingImage}
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Firestore...</span>
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
