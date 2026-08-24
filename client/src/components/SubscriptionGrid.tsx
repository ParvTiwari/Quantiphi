import { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  Edit2,
  Search, 
  SlidersHorizontal, 
  Power, 
  Layers, 
  CalendarDays,
  CheckCircle2,
  PauseCircle,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { Subscription } from '../types/subscription';
import { formatCurrency, formatDate } from '../utils/formatters';

interface SubscriptionGridProps {
  subscriptions: Subscription[];
  onToggleStatus: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (subscription: Subscription) => void;
  isLoading: boolean;
}

type FilterStatus = 'all' | 'active' | 'paused' | 'urgent';
type SortOption = 'renewal-asc' | 'cost-desc' | 'cost-asc' | 'name';

export const SubscriptionGrid: React.FC<SubscriptionGridProps> = ({
  subscriptions,
  onToggleStatus,
  onDelete,
  onEdit,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('renewal-asc');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    try {
      setTogglingId(id);
      await onToggleStatus(id);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from your subscriptions?`)) {
      try {
        setDeletingId(id);
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Filter and sort subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        // Search filter
        const matchesSearch =
          sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (sub.category && sub.category.toLowerCase().includes(searchQuery.toLowerCase()));

        // Status filter
        let matchesStatus = true;
        if (statusFilter === 'active') matchesStatus = sub.status === 'active';
        if (statusFilter === 'paused') matchesStatus = sub.status === 'paused';
        if (statusFilter === 'urgent') matchesStatus = sub.isRenewingSoon && sub.status === 'active';

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'renewal-asc') {
          return a.daysRemaining - b.daysRemaining;
        }
        if (sortBy === 'cost-desc') {
          return b.normalizedMonthlyCost - a.normalizedMonthlyCost;
        }
        if (sortBy === 'cost-asc') {
          return a.normalizedMonthlyCost - b.normalizedMonthlyCost;
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [subscriptions, searchQuery, statusFilter, sortBy]);

  // Counts for filter pills
  const urgentCount = subscriptions.filter((s) => s.isRenewingSoon && s.status === 'active').length;
  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const pausedCount = subscriptions.filter((s) => s.status === 'paused').length;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl shadow-black/20 overflow-hidden">
      {/* Header & Controls Toolbar */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Subscription Grid
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {filteredSubscriptions.length} of {subscriptions.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your recurring services, track urgent renewals, and toggle "The Vibe Check" savings simulation.
          </p>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-inner">
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-slate-950 text-slate-100 font-medium text-xs focus:outline-none cursor-pointer [color-scheme:dark]"
            >
              <option value="renewal-asc" className="bg-slate-900 text-slate-100 py-1.5">Renewal: Soonest</option>
              <option value="cost-desc" className="bg-slate-900 text-slate-100 py-1.5">Cost: High to Low</option>
              <option value="cost-asc" className="bg-slate-900 text-slate-100 py-1.5">Cost: Low to High</option>
              <option value="name" className="bg-slate-900 text-slate-100 py-1.5">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-500 font-medium mr-1 flex items-center">
          <SlidersHorizontal className="w-3 h-3 mr-1" /> Filter:
        </span>

        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            statusFilter === 'all'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          All ({subscriptions.length})
        </button>

        <button
          onClick={() => setStatusFilter('active')}
          className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
            statusFilter === 'active'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 shadow-sm'
              : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Active ({activeCount})
        </button>

        <button
          onClick={() => setStatusFilter('urgent')}
          className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
            statusFilter === 'urgent'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80 shadow-sm'
              : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
          }`}
        >
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          Renewing Soon ({urgentCount})
        </button>

        <button
          onClick={() => setStatusFilter('paused')}
          className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
            statusFilter === 'paused'
              ? 'bg-slate-800 text-slate-300 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <PauseCircle className="w-3 h-3 text-slate-400" />
          Paused ({pausedCount})
        </button>
      </div>

      {/* The Subscriptions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-5">Service / Application</th>
              <th className="py-3.5 px-4">Billing Plan</th>
              <th className="py-3.5 px-4">Normalized Monthly Cost</th>
              <th className="py-3.5 px-4">Next Renewal Date</th>
              <th className="py-3.5 px-4 text-center">The Vibe Check (Status)</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {filteredSubscriptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <Layers className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
                  <p className="font-semibold text-slate-400">No subscriptions found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Add your first subscription above to start tracking.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredSubscriptions.map((sub) => {
                const isPaused = sub.status === 'paused';
                const isUrgent = sub.isRenewingSoon && !isPaused;

                return (
                  <tr
                    key={sub.id}
                    className={`transition-all duration-200 group ${
                      isPaused
                        ? 'bg-slate-950/40 opacity-60 hover:opacity-80 grayscale-[20%]'
                        : isUrgent
                        ? 'bg-amber-950/15 hover:bg-amber-950/25 border-l-4 border-l-amber-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* 1. Service Name & Category */}
                    <td className="py-4 px-5">
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-sm ${
                          isPaused
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : isUrgent
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {sub.name.substring(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold tracking-tight ${
                              isPaused ? 'text-slate-400 line-through' : 'text-white'
                            }`}>
                              {sub.name}
                            </span>
                            {sub.category && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
                                {sub.category}
                              </span>
                            )}
                          </div>
                          {isPaused && (
                            <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                              <PauseCircle className="w-3 h-3" />
                              Paused • Saving {formatCurrency(sub.normalizedMonthlyCost)}/mo
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. Billing Frequency & Raw Cost */}
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-mono font-semibold text-slate-200">
                          {formatCurrency(sub.cost)}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">
                          /{sub.billingCycle === 'yearly' ? 'yr' : 'mo'}
                        </span>
                      </div>
                      <div className="mt-0.5">
                        <span className={`inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          sub.billingCycle === 'yearly'
                            ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {sub.billingCycle}
                        </span>
                      </div>
                    </td>

                    {/* 3. Normalized Monthly Cost (Cost Uniformity Engine) */}
                    <td className="py-4 px-4">
                      <div className="flex items-baseline space-x-1">
                        <span className={`font-mono font-bold ${
                          isPaused ? 'text-slate-500 line-through' : 'text-emerald-400'
                        }`}>
                          {formatCurrency(sub.normalizedMonthlyCost)}
                        </span>
                        <span className="text-xs text-slate-500">/mo</span>
                      </div>
                      {sub.billingCycle === 'yearly' && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-500/70" />
                          Uniformity: cost ÷ 12
                        </span>
                      )}
                    </td>

                    {/* 4. Next Renewal Date & Caution Badge */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-300 font-medium text-xs font-mono">
                          {formatDate(sub.renewalDate)}
                        </span>
                      </div>

                      {/* Amber Caution Badge for renewals within 7 days */}
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        {sub.isRenewingSoon ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm animate-pulse">
                            <AlertTriangle className="w-3 h-3 mr-1 text-amber-400" />
                            Renewing Soon
                            <span className="ml-1 text-[10px] opacity-80 font-normal">
                              ({sub.daysRemaining === 0 ? 'Today' : `${sub.daysRemaining}d`})
                            </span>
                          </span>
                        ) : sub.daysRemaining < 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-950/60 text-red-400 border border-red-800/60">
                            Overdue ({Math.abs(sub.daysRemaining)}d ago)
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] text-slate-500 font-medium">
                            in {sub.daysRemaining} days
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 5. The Vibe Check: Interactive Active / Paused Toggle */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex flex-col items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(sub.id)}
                          disabled={togglingId === sub.id || isLoading}
                          title={`Click to ${isPaused ? 'Activate' : 'Pause'} subscription (The Vibe Check)`}
                          aria-label={`Toggle status for ${sub.name}`}
                          className={`relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                            !isPaused ? 'bg-emerald-500' : 'bg-slate-700'
                          } ${togglingId === sub.id ? 'opacity-50 cursor-wait' : ''}`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              !isPaused ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`text-[11px] font-semibold mt-1 tracking-tight ${
                          !isPaused ? 'text-emerald-400' : 'text-slate-400'
                        }`}>
                          {!isPaused ? 'Active' : 'Paused'}
                        </span>
                      </div>
                    </td>

                    {/* 6. Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onEdit(sub)}
                          disabled={isLoading}
                          title={`Edit ${sub.name}`}
                          className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id, sub.name)}
                          disabled={deletingId === sub.id || isLoading}
                          title={`Delete ${sub.name}`}
                          className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-800/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center space-x-2">
          <Power className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            <strong>The Vibe Check:</strong> Toggling a subscription to <em>Paused</em> greys out the row and dynamically simulates instant cash-flow savings.
          </span>
        </div>
        <div className="text-slate-500">
          Showing {filteredSubscriptions.length} subscriptions
        </div>
      </div>
    </div>
  );
};
