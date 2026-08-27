import React, { useState, useEffect } from 'react';
import { X, Save, IndianRupee, Sparkles, Tag } from 'lucide-react';
import { DatePicker } from './DatePicker';
import { Subscription, BillingCycle, CreateSubscriptionInput } from '../types/subscription';
import { formatCurrency } from '../utils/formatters';

interface EditSubscriptionModalProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<CreateSubscriptionInput>) => Promise<void>;
}

export const EditSubscriptionModal: React.FC<EditSubscriptionModalProps> = ({
  subscription,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [renewalDate, setRenewalDate] = useState('');
  const [category, setCategory] = useState('General');
  const [status, setStatus] = useState<'active' | 'paused'>('active');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subscription) {
      setName(subscription.name);
      setCost(subscription.cost.toString());
      setBillingCycle(subscription.billingCycle);
      setRenewalDate(subscription.renewalDate);
      setCategory(subscription.category || 'General');
      setStatus(subscription.status);
      setError(null);
    }
  }, [subscription]);

  if (!isOpen || !subscription) return null;

  const numericCost = parseFloat(cost) || 0;
  const normalizedMonthlyPreview = billingCycle === 'yearly'
    ? Math.round((numericCost / 12 + Number.EPSILON) * 100) / 100
    : numericCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Service name is required');
      return;
    }
    if (isNaN(numericCost) || numericCost <= 0) {
      setError('Please enter a valid cost greater than ₹0.00');
      return;
    }
    if (!renewalDate) {
      setError('Please pick a renewal date');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(subscription.id, {
        name: name.trim(),
        cost: numericCost,
        billingCycle,
        renewalDate,
        category,
        status,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 overflow-visible"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-subscription-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 id="edit-subscription-title" className="text-base font-bold text-white flex items-center gap-2">
              Edit Subscription Details
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Update pricing, renewal date, or billing frequency.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Service Name <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700/90 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Cost (₹) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cost (₹ INR) <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700/90 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
                />
              </div>
            </div>

            {/* Billing Cycle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Billing Cycle <span className="text-emerald-400">*</span>
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className="w-full bg-slate-950 border border-slate-700/90 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 [color-scheme:dark]"
              >
                <option value="monthly" className="bg-slate-900 text-slate-100">Monthly</option>
                <option value="yearly" className="bg-slate-900 text-slate-100">Yearly / Annual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Renewal Date */}
            <div>
              <DatePicker
                value={renewalDate}
                onChange={setRenewalDate}
                label="Next Renewal Date"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Tag className="w-4 h-4" />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/90 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 [color-scheme:dark]"
                >
                  <option value="General" className="bg-slate-900 text-slate-100">General</option>
                  <option value="Entertainment" className="bg-slate-900 text-slate-100">Entertainment</option>
                  <option value="Developer Tools" className="bg-slate-900 text-slate-100">Developer Tools</option>
                  <option value="Productivity" className="bg-slate-900 text-slate-100">Productivity</option>
                  <option value="Cloud & Infra" className="bg-slate-900 text-slate-100">Cloud & Infra</option>
                  <option value="AI Tools" className="bg-slate-900 text-slate-100">AI Tools</option>
                  <option value="Design" className="bg-slate-900 text-slate-100">Design</option>
                  <option value="Music" className="bg-slate-900 text-slate-100">Music</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cost Uniformity Preview */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Normalized Monthly Impact:
            </span>
            <span className="font-bold text-white font-mono">
              {formatCurrency(normalizedMonthlyPreview)}/month
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
