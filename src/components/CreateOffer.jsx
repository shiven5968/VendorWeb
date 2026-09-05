import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Plus, Loader2, CheckCircle2, AlertCircle, X, Sparkles, Tag } from 'lucide-react';

/**
 * createRewardOffer: Direct Firestore writer to shared /rewards collection
 * Used across Vendor Portal to create live student reward offers
 */
export const createRewardOffer = async (offerData) => {
  try {
    const docRef = await addDoc(collection(db, 'rewards'), {
      ...offerData,
      isActive: true,
      claimedCount: 0,
      createdAt: serverTimestamp()
    });
    console.log('Offer published with ID: ', docRef.id);
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error('Error adding document: ', e);
    return { success: false, error: e.message };
  }
};

export const CreateOffer = ({ isOpen, onClose, vendorId = 'vendor_burger_club', vendorName = 'The Burger Club', onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [pointsRequired, setPointsRequired] = useState(150);
  const [discountCode, setDiscountCode] = useState('');
  const [totalVouchers, setTotalVouchers] = useState(50);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter offer title.' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    const payload = {
      vendorId,
      vendorName,
      title: title.trim(),
      description: description.trim(),
      category,
      pointsRequired: Number(pointsRequired) || 100,
      discountCode: (discountCode.trim() || ('ABES' + Math.random().toString(36).substring(2, 6).toUpperCase())),
      totalVouchers: Number(totalVouchers) || 50,
      expiryDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]
    };

    const res = await createRewardOffer(payload);
    setLoading(false);

    if (res.success) {
      setStatusMessage({ type: 'success', text: 'Offer published live to MessMates students!' });
      if (onSuccess) onSuccess(res.id);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to publish offer to Firestore.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
            <Tag className="w-5 h-5" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">Create & Publish Offer</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div className={`p-3 rounded-2xl text-xs font-bold flex items-center space-x-2 ${
            statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs font-semibold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Offer Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. 20% OFF on Weekend Combo"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option>Food & Dining</option>
                <option>Fitness</option>
                <option>Entertainment</option>
                <option>Hostel Essentials</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Points Required</label>
              <input
                type="number"
                min="10"
                value={pointsRequired}
                onChange={e => setPointsRequired(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/25 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Publish to Shared /rewards</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateOffer;
