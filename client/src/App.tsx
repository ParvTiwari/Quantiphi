import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MetricsRow } from './components/MetricsRow';
import { SubscriptionForm } from './components/SubscriptionForm';
import { subscriptionApi } from './services/api';
import { Subscription, DashboardMetrics, CreateSubscriptionInput } from './types/subscription';

export default function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [subsData, metricsData] = await Promise.all([
        subscriptionApi.getAll(),
        subscriptionApi.getMetrics(),
      ]);
      setSubscriptions(subsData);
      setMetrics(metricsData);
    } catch (err: unknown) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddSubscription = async (input: CreateSubscriptionInput) => {
    const { subscription, metrics: newMetrics } = await subscriptionApi.create(input);
    setSubscriptions((prev) => [subscription, ...prev]);
    setMetrics(newMetrics);
  };

  const handleResetDemoData = async () => {
    try {
      setIsLoading(true);
      const { subscriptions: resetSubs, metrics: newMetrics } = await subscriptionApi.reset();
      setSubscriptions(resetSubs);
      setMetrics(newMetrics);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset demo data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col antialiased">
      {/* Top Header with live calendar date and quick actions */}
      <Header
        onReset={handleResetDemoData}
        isLoading={isLoading}
        totalSubs={subscriptions.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-800/80 text-red-300 text-sm flex items-center justify-between shadow-lg">
            <div>
              <p className="font-semibold">Backend Connection Notice</p>
              <p className="text-xs text-red-400 mt-0.5">{error}. Ensure the API server is running (`npm run dev:server`).</p>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-xs font-semibold text-white border border-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* 1. The Metrics Row */}
        <section aria-label="Dashboard Metrics">
          <MetricsRow metrics={metrics} isLoading={isLoading} />
        </section>

        {/* 2. The Entry Form */}
        <section aria-label="Subscription Entry Form">
          <SubscriptionForm onAdd={handleAddSubscription} isLoading={isLoading} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          SubPulse Dashboard • Cost Uniformity Engine & Date Intersect Calculator Active
        </div>
      </footer>
    </div>
  );
}
