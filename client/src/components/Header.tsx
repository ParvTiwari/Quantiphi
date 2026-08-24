import { Activity, Calendar, RotateCcw, Sparkles } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  isLoading: boolean;
  totalSubs: number;
}

export const Header: React.FC<HeaderProps> = ({ onReset, isLoading, totalSubs }) => {
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
              <Activity className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white">
                  Sub<span className="text-emerald-400">Pulse</span>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Live Dashboard
                </span>
              </div>
              <p className="text-xs text-slate-400">
                The Subscription Tracker & Renewal Dashboard
              </p>
            </div>
          </div>

          {/* Current Date context & Controls */}
          <div className="flex items-center space-x-3 self-end sm:self-center">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Today: <strong className="text-slate-100 font-semibold">{todayFormatted}</strong></span>
            </div>

            <button
              onClick={onReset}
              disabled={isLoading}
              title="Reset with sample subscription dataset"
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Reset Demo ({totalSubs})
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
