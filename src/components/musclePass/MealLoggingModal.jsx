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
  Sparkles,
  Info
} from 'lucide-react';
import { calculateItemNutrition } from '../../services/nutritionEngine.js';

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
  // Items state: mapping item name -> { portion, proteinPerServing, caloriesPerServing, isExtra }
  const [itemsState, setItemsState] = useState([]);
  const [extraFoodName, setExtraFoodName] = useState('');
  const [extraProteinG, setExtraProteinG] = useState('');
  const [extraCalories, setExtraCalories] = useState('');
  const [isSkipping, setIsSkipping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingLog && Array.isArray(existingLog.items) && existingLog.items.length > 0) {
      // Round portion to integer 1, 2, 3, 4 (or 0)
      const mapped = existingLog.items.map(it => ({
        ...it,
        portion: Math.max(0, Math.min(4, Math.round(Number(it.portion) || 1)))
      }));
      setItemsState(mapped);
      setIsSkipping(existingLog.status === 'SKIPPED');
    } else {
      // Default: all menu items set to 1 standard serving
      const initial = (parsedItems || []).map(item => ({
        name: item.name,
        portion: 1,
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
      portion: 1,
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
    // Set all standard items to 1 serving
    setItemsState(prev => prev.map(item => ({ ...item, portion: 1 })));
    setIsSkipping(false);
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const computedItems = itemsState.map(item => {
        const p = isSkipping ? 0 : item.portion;
        const { proteinConsumed, caloriesConsumed } = calculateItemNutrition({
          proteinPerServing: item.proteinPerServing,
          caloriesPerServing: item.caloriesPerServing,
          portion: p
        });
        return {
          name: item.name,
          portion: p,
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

  const SERVING_OPTIONS = [
    { value: 0, label: '0', sub: 'Skip' },
    { value: 1, label: '1', sub: 'Std' },
    { value: 2, label: '2', sub: 'Double' },
    { value: 3, label: '3', sub: 'Large' },
    { value: 4, label: '4', sub: 'Max' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="space-y-5 p-1">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
                {mealCategory}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Log Your Meal Servings
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              {mealTitle || 'Hostel Mess Meal'} • Select 1, 2, 3 or 4 servings for each item
            </p>
          </div>

          {existingLog && (
            <button
              onClick={() => { onDeleteLog(mealCategory); onClose(); }}
              className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center space-x-1 p-2 rounded-xl hover:bg-rose-50 transition-colors"
              title="Reset this meal log"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Quick Action Buttons: Standard 1-Serving vs Skipped */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleQuickEatAll}
            className={`py-3 px-4 rounded-2xl border text-xs sm:text-sm font-black flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              !isSkipping
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Ate Standard Plate (1 Serving All)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSkipping(true)}
            className={`py-3 px-4 rounded-2xl border text-xs sm:text-sm font-black flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              isSkipping
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <MinusCircle className="w-4 h-4" />
            <span>Skipped This Meal</span>
          </button>
        </div>

        {/* Live Calculation Banner */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              {isSkipping ? 'Meal Status' : 'Estimated Intake From This Meal'}
            </span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {isSkipping ? '0g (Skipped)' : `${totalProtein}g Protein`}
              </span>
              {!isSkipping && (
                <span className="text-xs font-semibold text-emerald-400">
                  calculated live
                </span>
              )}
            </div>
          </div>

          {!isSkipping && totalCalories > 0 && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-amber-400 font-bold">
              <Flame className="w-4 h-4" />
              <span>~{totalCalories} kcal</span>
            </div>
          )}
        </div>

        {/* Items List & Serving Selectors */}
        {!isSkipping && (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" />
                <span>Adjust Servings (1, 2, 3, 4)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                1 = Standard mess katori / portion
              </span>
            </div>

            {itemsState.map((item, index) => {
              const currentPortion = Math.max(0, Math.min(4, Math.round(Number(item.portion) || 0)));
              const itemProt = Math.round(((item.proteinPerServing || 0) * currentPortion) * 10) / 10;
              const itemCals = Math.round((item.caloriesPerServing || 0) * currentPortion);

              return (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-emerald-300"
                >
                  {/* Dish Name & Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-black text-slate-900 truncate">
                        {item.name}
                      </h4>
                      {item.isExtra && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                          EXTRA
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      {item.proteinPerServing ? (
                        <span>~{item.proteinPerServing}g protein per 1 serving</span>
                      ) : (
                        <span>Standard side / staple</span>
                      )}
                    </div>
                  </div>

                  {/* Integer Serving Selector (0, 1, 2, 3, 4) */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200">
                      {SERVING_OPTIONS.map((opt) => {
                        const isSelected = currentPortion === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handlePortionChange(index, opt.value)}
                            className={`w-10 h-10 rounded-xl font-black text-xs transition-all flex flex-col items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                            title={`${opt.label} Serving (${opt.sub})`}
                          >
                            <span className="text-sm font-black leading-none">{opt.label}</span>
                            <span className="text-[8px] font-bold uppercase opacity-85 leading-tight">{opt.sub}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Calculated Protein Badge for this item */}
                    <div className="min-w-[68px] text-right">
                      <span className="text-sm font-black text-emerald-700 block">
                        +{itemProt}g
                      </span>
                      {itemCals > 0 && (
                        <span className="text-[10px] text-slate-400 font-bold block">
                          ~{itemCals} kcal
                        </span>
                      )}
                    </div>

                    {item.isExtra && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraFood(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove extra food"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Extra Outside Food (Canteen / Hostel / Shake) */}
        {!isSkipping && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Add Outside or Canteen Item (e.g. 2 Boiled Eggs, Whey, Milk)</span>
            </span>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="Item name (e.g. 2 Boiled Eggs)"
                value={extraFoodName}
                onChange={e => setExtraFoodName(e.target.value)}
                className="w-full sm:flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                placeholder="Protein (g)"
                value={extraProteinG}
                onChange={e => setExtraProteinG(e.target.value)}
                className="w-full sm:w-28 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddExtraFood}
                disabled={!extraFoodName.trim()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 disabled:opacity-40 transition-all cursor-pointer"
              >
                + Add Item
              </button>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black shadow-md flex items-center space-x-2 cursor-pointer disabled:opacity-50 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Confirm & Save Log'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
