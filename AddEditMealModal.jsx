import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Utensils, Save, Sparkles, Calendar } from 'lucide-react';

export const AddEditMealModal = () => {
  const { isAddMealModalOpen, setIsAddMealModalOpen, editingMeal, setEditingMeal, saveMeal, selectedDay } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Breakfast',
    targetDay: selectedDay || 'Friday',
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

  useEffect(() => {
    if (editingMeal) {
      setFormData({
        id: editingMeal.id,
        name: editingMeal.name,
        category: editingMeal.category,
        targetDay: selectedDay || 'Friday',
        calories: editingMeal.calories,
        protein: editingMeal.protein,
        carbs: editingMeal.carbs,
        fats: editingMeal.fats,
        image: editingMeal.image,
        ingredientsStr: editingMeal.ingredients ? editingMeal.ingredients.join(', ') : '',
        items: editingMeal.items || editingMeal.description || '',
        gymRecommended: editingMeal.gymRecommended || false,
        description: editingMeal.description || '',
      });
    } else {
      setFormData({
        name: '',
        category: 'Breakfast',
        targetDay: selectedDay || 'Friday',
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
    }
  }, [editingMeal, isAddMealModalOpen, selectedDay]);

  if (!isAddMealModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalMeal = {
      ...formData,
      calories: Number(formData.calories),
      protein: Number(formData.protein),
      carbs: Number(formData.carbs),
      fats: Number(formData.fats),
      ingredients: formData.ingredientsStr.split(',').map(s => s.trim()).filter(Boolean),
    };
    saveMeal(finalMeal, formData.targetDay);
    setIsAddMealModalOpen(false);
    setEditingMeal(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {editingMeal ? 'Edit Mess Menu Item' : 'Upload New Mess Item'}
              </h3>
              <p className="text-xs text-slate-500">ABES Boys Hostel Mess Committee Studio</p>
            </div>
          </div>
          <button
            onClick={() => { setIsAddMealModalOpen(false); setEditingMeal(null); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
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
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Combo Items Served (As shown on Notice Board)</label>
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

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Food Image URL</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
              <img src={formData.image} alt="Preview" className="w-10 h-10 rounded-lg object-cover border" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ingredients (comma separated)</label>
            <input
              type="text"
              value={formData.ingredientsStr}
              onChange={e => setFormData({ ...formData, ingredientsStr: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => { setIsAddMealModalOpen(false); setEditingMeal(null); }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{editingMeal ? 'Update Menu Item' : 'Publish to Weekly Menu'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
