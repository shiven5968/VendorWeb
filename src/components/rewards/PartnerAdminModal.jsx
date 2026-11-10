import React, { useState } from 'react';
import { 
  X, 
  Store, 
  Plus, 
  Save, 
  AlertCircle, 
  Check, 
  Tag, 
  Calendar 
} from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

export const PartnerAdminModal = ({
  isOpen,
  onClose,
  currentUser,
  addNotification
}) => {
  const [title, setTitle] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [category, setCategory] = useState('Food & Beverages');
  const [pointsRequired, setPointsRequired] = useState('40');
  const [totalVouchers, setTotalVouchers] = useState('50');
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState('Show voucher code at counter before billing.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !vendorName.trim()) return;

    setIsSubmitting(true);
    const newOfferId = 'offer_' + Date.now();

    const offerData = {
      id: newOfferId,
      title: title.trim(),
      vendorName: vendorName.trim(),
      vendorId: currentUser?.uid || 'partner_vendor',
      category,
      pointsRequired: Number(pointsRequired) || 40,
      totalVouchers: Number(totalVouchers) || 50,
      claimedCount: 0,
      expiryDate,
      description: description.trim(),
      terms: terms.trim(),
      isActive: true,
      createdBy: currentUser?.email || currentUser?.name || 'Admin',
      createdAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, 'rewards', newOfferId), offerData);
      if (addNotification) {
        addNotification('Offer Published! 🎉', `${title} is now live in the Partner Marketplace.`, 'success');
      }
      onClose();
    } catch (err) {
      console.error('Error publishing reward:', err);
      alert('Error publishing offer: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative p-6 space-y-4 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-black text-slate-900">
              Publish New Campus Partner Deal
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Partner / Vendor Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Campus Blend Cafe"
                value={vendorName}
                onChange={e => setVendorName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold outline-none focus:border-emerald-500"
              >
                <option value="Food & Beverages">Food &amp; Beverages</option>
                <option value="Cafes">Cafes</option>
                <option value="Fitness & Wellness">Fitness &amp; Wellness</option>
                <option value="Student Essentials">Student Essentials</option>
                <option value="Special Campus Offers">Special Campus Offers</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Offer Title</label>
            <input
              type="text"
              required
              placeholder="e.g. 15% Off Any Cold Coffee or Shake"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Points Required</label>
              <input
                type="number"
                required
                value={pointsRequired}
                onChange={e => setPointsRequired(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Voucher Quota</label>
              <input
                type="number"
                required
                value={totalVouchers}
                onChange={e => setTotalVouchers(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Offer Description</label>
            <textarea
              rows="2"
              required
              placeholder="Explain what the student gets and how it works..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Redemption Terms &amp; Conditions</label>
            <input
              type="text"
              placeholder="e.g. Valid once per student bill. Show voucher before billing."
              value={terms}
              onChange={e => setTerms(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-xs cursor-pointer flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Live Deal'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
