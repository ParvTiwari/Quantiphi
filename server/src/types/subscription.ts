export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'paused';

export interface Subscription {
  id: string;
  name: string;
  cost: number; // Raw cost entered by user
  billingCycle: BillingCycle;
  renewalDate: string; // ISO date string 'YYYY-MM-DD'
  status: SubscriptionStatus;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnrichedSubscription extends Subscription {
  normalizedMonthlyCost: number; // Normalized cost per month (e.g. annual / 12)
  daysRemaining: number; // Days until next renewal from reference date
  isRenewingSoon: boolean; // True if 0 <= daysRemaining <= 7
  urgencyBadgeText?: string;
}

export interface DashboardMetrics {
  totalMonthlyBurnRate: number; // Sum of active subscriptions' normalized monthly cost
  pausedMonthlySavings: number; // Sum of paused subscriptions' normalized monthly cost
  upcomingRenewalsAlertCount: number; // Count of active subscriptions renewing within <= 7 days
  activeCount: number;
  pausedCount: number;
  totalCount: number;
  annualBurnRate: number; // Projected annual active burn rate (totalMonthlyBurnRate * 12)
}

export interface CreateSubscriptionInput {
  name: string;
  cost: number;
  billingCycle: BillingCycle;
  renewalDate: string;
  status?: SubscriptionStatus;
  category?: string;
}
