import { TrendingDown, AlertTriangle, ShieldCheck, IndianRupee, Clock, PauseCircle, CheckCircle2 } from 'lucide-react';
import { DashboardMetrics } from '../types/subscription';
import { formatCurrency } from '../utils/formatters';

interface MetricsRowProps {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
}

export const MetricsRow: React.FC<MetricsRowProps> = ({ metrics, isLoading }) => {
  const burnRate = metrics?.totalMonthlyBurnRate ?? 0;
  const savings = metrics?.pausedMonthlySavings ?? 0;
  const alertCount = metrics?.upcomingRenewalsAlertCount ?? 0;
  const activeCount = metrics?.activeCount ?? 0;
  const pausedCount = metrics?.pausedCount ?? 0;
  const annualBurn = metrics?.annualBurnRate ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 mb-8">
      {/* 1. Total Monthly Burn Rate Card */}
      <div className="lg:col-span-7 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-850 border border-slate-800 p-6 shadow-xl shadow-black/20 hover:border-emerald-500/30 transition-all duration-300">
        {/* Background glow accent */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <IndianRupee className="w-5 h-5" />
              </span>
              <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Total Monthly Burn Rate
              </p>
            </div>

            <div className="mt-4 flex items-baseline space-x-3">
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                {isLoading ? (
                  <span className="animate-pulse text-slate-600">---.--</span>
                ) : (
                  formatCurrency(burnRate)
                )}
              </h2>
              <span className="text-sm font-medium text-slate-400">/ month</span>
            </div>
          </div>

          {/* Active Subscriptions Badge */}
          <div className="text-right">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              {activeCount} Active
            </span>
          </div>
        </div>

        {/* Real-time Savings Simulator & Annual projection */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Paused Savings Simulation */}
          <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <PauseCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="truncate">
              <span className="text-slate-400">Paused Savings: </span>
              <span className="font-bold text-amber-300 font-mono">
                {formatCurrency(savings)}/mo
              </span>
              {pausedCount > 0 && (
                <span className="text-slate-500 ml-1">({pausedCount} paused)</span>
              )}
            </div>
          </div>

          {/* Projected Annual Burn */}
          <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <TrendingDown className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="truncate">
              <span className="text-slate-400">Annual Projection: </span>
              <span className="font-bold text-slate-200 font-mono">
                {formatCurrency(annualBurn)}/yr
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Upcoming Renewals Alert Count Card */}
      <div className={`lg:col-span-5 relative overflow-hidden rounded-2xl border p-6 shadow-xl shadow-black/20 transition-all duration-300 ${
        alertCount > 0
          ? 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/30 hover:border-amber-500/50'
          : 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-850 border-slate-800 hover:border-slate-700'
      }`}>
        {/* Amber glow if alert active */}
        {alertCount > 0 && (
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl pointer-events-none animate-pulse" />
        )}

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`p-2 rounded-lg border ${
                alertCount > 0
                  ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                {alertCount > 0 ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                )}
              </span>
              <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Upcoming Renewals Alert
              </p>
            </div>

            <div className="mt-4 flex items-baseline space-x-3">
              <h2 className={`text-4xl sm:text-5xl font-black tracking-tight font-mono ${
                alertCount > 0 ? 'text-amber-400' : 'text-slate-300'
              }`}>
                {isLoading ? (
                  <span className="animate-pulse text-slate-600">-</span>
                ) : (
                  alertCount
                )}
              </h2>
              <span className="text-sm font-medium text-slate-400">
                {alertCount === 1 ? 'subscription due' : 'subscriptions due'}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div>
            {alertCount > 0 ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 animate-ping" />
                Urgent Action
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                All Clear
              </span>
            )}
          </div>
        </div>

        {/* 7-Day Window Explanation */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Renewal Horizon:</span>
              <strong className="text-slate-200">Next 7 Calendar Days</strong>
            </div>
            {alertCount > 0 ? (
              <span className="text-amber-400 font-medium font-mono text-[11px]">
                Renewing Soon
              </span>
            ) : (
              <span className="text-emerald-400 font-medium text-[11px]">
                No immediate payments
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
