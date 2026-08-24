import { useState } from 'react';
import { PlusCircle, Calendar, IndianRupee, Tag, Check, Sparkles, AlertCircle } from 'lucide-react';
import { BillingCycle, CreateSubscriptionInput } from '../types/subscription';
import { formatCurrency } from '../utils/formatters';

interface SubscriptionFormProps {
  onAdd: (data: CreateSubscriptionInput) => Promise<void>;
  isLoading: boolean;
}

const POPULAR_SERVICES = [
  { name: 'Netflix Premium 4K', defaultCost: 649.00, cycle: 'monthly' as BillingCycle, category: 'Entertainment' },
  { name: 'Spotify Premium', defaultCost: 119.00, cycle: 'monthly' as BillingCycle, category: 'Music' },
  { name: 'ChatGPT Plus', defaultCost: 1999.00, cycle: 'monthly' as BillingCycle, category: 'AI Tools' },
  { name: 'GitHub Copilot Pro', defaultCost: 8400.00, cycle: 'yearly' as BillingCycle, category: 'Developer Tools' },
  { name: 'AWS Cloud Hosting', defaultCost: 9600.00, cycle: 'yearly' as BillingCycle, category: 'Cloud & Infra' },
  { name: 'Figma Professional', defaultCost: 1250.00, cycle: 'monthly' as BillingCycle, category: 'Design' },
  { name: 'Notion Team Plus', defaultCost: 7800.00, cycle: 'yearly' as BillingCycle, category: 'Productivity' },
];

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ onAdd, isLoading }) => {
  const getTodayISO = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const [name, setName] = useState('');
  const [cost, setCost] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [renewalDate, setRenewalDate] = useState<string>(getTodayISO());
  const [category, setCategory] = useState('General');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Live calculation of normalized monthly cost for instant user feedback
  const numericCost = parseFloat(cost) || 0;
  const normalizedMonthlyPreview = billingCycle === 'yearly'
    ? Math.round((numericCost / 12 + Number.EPSILON) * 100) / 100
    : numericCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter a service name.');
      return;
    }

    if (isNaN(numericCost) || numericCost <= 0) {
      setError('Please enter a valid cost greater than ₹0.00.');
      return;
    }

    if (!renewalDate) {
      setError('Please pick a next renewal date.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAdd({
        name: name.trim(),
        cost: numericCost,
        billingCycle,
        renewalDate,
        status: 'active',
        category,
      });

      // Reset form
      setName('');
      setCost('');
      setBillingCycle('monthly');
      setRenewalDate(getTodayISO());
      setCategory('General');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPreset = (preset: typeof POPULAR_SERVICES[0]) => {
    setName(preset.name);
    setCost(preset.defaultCost.toString());
    setBillingCycle(preset.cycle);
    setCategory(preset.category);
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl shadow-black/20 relative overflow-hidden mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-5">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            Add Recurring Subscription
          </h3>
          <p className="text-xs text-slate-400">
            Log a recurring SaaS or streaming plan to update your live monthly burn rate.
          </p>
        </div>

        {/* Popular Quick-Select Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-slate-500 mr-1 flex items-center">
            <Sparkles className="w-3 h-3 mr-1 text-emerald-400" /> Quick Add:
          </span>
          {POPULAR_SERVICES.slice(0, 4).map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-emerald-300 text-slate-300 border border-slate-700/80 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {showSuccessToast && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>Subscription added successfully! Metrics have been updated.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Service Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Service Name <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Netflix, OpenAI, AWS"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700/90 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* 2. Currency Cost Field (Rupees) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cost (₹ INR) <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <IndianRupee className="w-4 h-4" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700/90 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono transition-all"
              />
            </div>
          </div>

          {/* 3. Billing Cycle Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Billing Cycle <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className="w-full bg-slate-950 border border-slate-700/90 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer [color-scheme:dark]"
              >
                <option value="monthly" className="bg-slate-900 text-slate-100 py-1.5">Monthly Billing</option>
                <option value="yearly" className="bg-slate-900 text-slate-100 py-1.5">Yearly / Annual Billing</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* 4. Visual Calendar Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Next Renewal Date <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700/90 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Cost Uniformity Engine Live Preview & Category Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          {/* Live Uniformity Explanation */}
          <div className="flex items-center gap-2 text-xs">
            {numericCost > 0 ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Cost Uniformity Engine:
                <strong className="ml-1 text-white font-mono">
                  {formatCurrency(normalizedMonthlyPreview)}/month
                </strong>
                {billingCycle === 'yearly' && (
                  <span className="text-slate-400 ml-1">
                    (normalized from {formatCurrency(numericCost)}/yr)
                  </span>
                )}
              </span>
            ) : (
              <span className="text-slate-500 text-[11px]">
                Enter cost and billing cycle to view normalized monthly impact.
              </span>
            )}
          </div>

          {/* Category & Submit Action */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs shadow-inner">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-950 text-slate-100 font-medium text-xs focus:outline-none cursor-pointer py-0.5 pr-2 [color-scheme:dark]"
              >
                <option value="General" className="bg-slate-900 text-slate-100 py-1.5">General</option>
                <option value="Entertainment" className="bg-slate-900 text-slate-100 py-1.5">Entertainment</option>
                <option value="Developer Tools" className="bg-slate-900 text-slate-100 py-1.5">Developer Tools</option>
                <option value="Productivity" className="bg-slate-900 text-slate-100 py-1.5">Productivity</option>
                <option value="Cloud & Infra" className="bg-slate-900 text-slate-100 py-1.5">Cloud & Infra</option>
                <option value="AI Tools" className="bg-slate-900 text-slate-100 py-1.5">AI Tools</option>
                <option value="Design" className="bg-slate-900 text-slate-100 py-1.5">Design</option>
                <option value="Music" className="bg-slate-900 text-slate-100 py-1.5">Music</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              {isSubmitting ? 'Adding...' : 'Add Subscription'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
