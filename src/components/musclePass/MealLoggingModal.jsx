import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { 
  Check, 
  X, 
  Plus, 
  Trash2, 
  Flame, 
  Dumbbell, 
  UtensilsCrossed, 
  CheckCircle2, 
  MinusCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { PORTION_LABELS, calculateItemNutrition } from '../../services/nutritionEngine.js';

export const MealLoggingModal = ({
  isOpen,
  onClose,
  mealCategory = 'Breakfast',
  mealTitle = '',
  parsedItems = [],
  existingLog = null,
  onSaveLog,
  onDeleteLog
}) => {
  // Items state: mapping item name -> { portionMultiplier, proteinG, calories, isExtra }
  const [itemsState, setItemsState] = useState([]);
  const [extraFoodName, setExtraFoodName] = useState('');
  const [extraProteinG, setExtraProteinG] = useState('');
  const [extraCalories, setExtraCalories] = useState('');
  const [isSkipping, setIsSkipping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingLog && Array.isArray(existingLog.items) && existingLog.items.length > 0) {
      setItemsState(existingLog.items);
      setIsSkipping(existingLog.status === 'SKIPPED');
    } else {
      // Default: all menu items at 1.0 (full serving)
      const initial = (parsedItems || []).map(item => ({
        name: item.name,
        portion: 1.0,
        proteinPerServing: item.proteinG || 0,
        caloriesPerServing: item.calories || 0,
        servingSize: item.servingSize || '1 serving',
        isExtra: false
      }));
      setItemsState(initial);
      setIsSkipping(false);
    }
  }, [existingLog, parsedItems, isOpen]);

  // Compute live totals
  let totalProtein = 0;
  let totalCalories = 0;

  if (!isSkipping) {
    for (const item of itemsState) {
      const { proteinConsumed, caloriesConsumed } = calculateItemNutrition({
        proteinPerServing: item.proteinPerServing,
        caloriesPerServing: item.caloriesPerServing,
        portion: item.portion
      });
      totalProtein += proteinConsumed;
      totalCalories += caloriesConsumed;
    }
  }

  totalProtein = Math.round(totalProtein * 10) / 10;
  totalCalories = Math.round(totalCalories);

  const handlePortionChange = (index, newPortion) => {
    setItemsState(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], portion: Number(newPortion) };
      return updated;
    });
    setIsSkipping(false);
  };

  const handleAddExtraFood = (e) => {
    e.preventDefault();
    if (!extraFoodName.trim()) return;

    const extra = {
      name: extraFoodName.trim(),
      portion: 1.0,
      proteinPerServing: Number(extraProteinG) || 0,
      caloriesPerServing: Number(extraCalories) || 0,
      servingSize: 'Custom',
      isExtra: true
    };

    setItemsState(prev => [...prev, extra]);
    setExtraFoodName('');
    setExtraProteinG('');
    setExtraCalories('');
    setIsSkipping(false);
  };

  const handleRemoveExtraFood = (index) => {
    setItemsState(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickEatAll = () => {
    // Set all standard items to 1.0
    setItemsState(prev => prev.map(item => ({ ...item, portion: 1.0 })));
    setIsSkipping(false);
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const computedItems = itemsState.map(item => {
        const { proteinConsumed, caloriesConsumed } = calculateItemNutrition({
          proteinPerServing: item.proteinPerServing,
          caloriesPerServing: item.caloriesPerServing,
          portion: isSkipping ? 0 : item.portion
        });
        return {
          name: item.name,
          portion: isSkipping ? 0 : item.portion,
          proteinConsumed,
          caloriesConsumed,
          isExtra: Boolean(item.isExtra)
        };
      });

      await onSaveLog({
        mealType: mealCategory,
        status: isSkipping ? 'SKIPPED' : 'COMPLETED',
        items: computedItems,
        proteinConsumed: isSkipping ? 0 : totalProtein,
        caloriesConsumed: isSkipping ? 0 : totalCalories
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase">
                {mealCategory}
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Log Meal Intake
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {mealTitle || 'Hostel Mess Meal'}
            </p>
          </div>

          {existingLog && (
            <button
              onClick={() => { onDeleteLog(mealCategory); onClose(); }}
              className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center space-x-1 p-1.5 rounded-lg hover:bg-rose-50"
              title="Delete this meal log"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Quick Action Pills: I Ate This vs Skipped */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleQuickEatAll}
            className={`py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center space-x-1.5 transition-all ${
              !isSkipping
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I Ate This (Standard)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSkipping(true)}
            className={`py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center space-x-1.5 transition-all ${
              isSkipping
                ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <MinusCircle className="w-4 h-4" />
            <span>Skipped This Meal</span>
          </button>
        </div>

        {/* Live Calculation Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">
              {isSkipping ? 'Status' : 'Intake Total'}
            </span>
            <span className="text-xl font-black text-white">
              {isSkipping ? 'Meal Skipped (0g)' : `${totalProtein}g Protein`}
            </span>
          </div>

          {!isSkipping && totalCalories > 0 && (
            <div className="flex items-center space-x-1 text-xs text-amber-400 font-bold">
              <Flame className="w-4 h-4" />
              <span>~{totalCalories} kcal</span>
            </div>
          )}
        </div>

        {/* Items List & Portion Selectors */}
        {!isSkipping && (
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Adjust Portions per Item
            </span>

            {itemsState.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {item.name}
                    </h4>
                    {item.isExtra && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 text-[9px] font-black">
                        EXTRA
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {item.proteinPerServing ? `${item.proteinPerServing}g/srv` : 'No protein data'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={item.portion}
                    onChange={e => handlePortionChange(index, e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="0">None (0)</option>
                    <option value="0.25">1/4 serving</option>
                    <option value="0.5">1/2 serving</option>
                    <option value="0.75">3/4 serving</option>
                    <option value="1.0">1 serving</option>
                    <option value="1.5">1.5 serving</option>
                    <option value="2.0">2 servings</option>
                  </select>

                  {item.isExtra && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExtraFood(index)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Extra Food Form */}
        {!isSkipping && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              + Add Outside / Canteen Food (e.g. Eggs, Whey, Milk)
            </span>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Food name (e.g. 2 Boiled Eggs)"
                value={extraFoodName}
                onChange={e => setExtraFoodName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none"
              />
              <input
                type="number"
                placeholder="Protein (g)"
                value={extraProteinG}
                onChange={e => setExtraProteinG(e.target.value)}
                className="w-24 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none"
              />
              <button
                type="button"
                onClick={handleAddExtraFood}
                disabled={!extraFoodName.trim()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Confirm & Save Log'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
