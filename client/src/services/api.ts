import { Subscription, DashboardMetrics, CreateSubscriptionInput } from '../types/subscription';

const API_BASE = '/api/subscriptions';

export const subscriptionApi = {
  async getAll(): Promise<Subscription[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch subscriptions');
    const json = await res.json();
    return json.data;
  },

  async getMetrics(): Promise<DashboardMetrics> {
    const res = await fetch(`${API_BASE}/metrics`);
    if (!res.ok) throw new Error('Failed to fetch metrics');
    const json = await res.json();
    return json.data;
  },

  async create(data: CreateSubscriptionInput): Promise<{ subscription: Subscription; metrics: DashboardMetrics }> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create subscription' }));
      throw new Error(err.error || 'Failed to create subscription');
    }
    const json = await res.json();
    return { subscription: json.data, metrics: json.metrics };
  },

  async update(id: string, data: Partial<CreateSubscriptionInput>): Promise<{ subscription: Subscription; metrics: DashboardMetrics }> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update subscription' }));
      throw new Error(err.error || 'Failed to update subscription');
    }
    const json = await res.json();
    return { subscription: json.data, metrics: json.metrics };
  },

  async toggleStatus(id: string): Promise<{ subscription: Subscription; metrics: DashboardMetrics }> {
    const res = await fetch(`${API_BASE}/${id}/toggle`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to toggle subscription status');
    const json = await res.json();
    return { subscription: json.data, metrics: json.metrics };
  },

  async delete(id: string): Promise<{ metrics: DashboardMetrics }> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete subscription');
    const json = await res.json();
    return { metrics: json.metrics };
  },

  async reset(): Promise<{ subscriptions: Subscription[]; metrics: DashboardMetrics }> {
    const res = await fetch(`${API_BASE}/reset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset demo data');
    const json = await res.json();
    return { subscriptions: json.data, metrics: json.metrics };
  },
};
