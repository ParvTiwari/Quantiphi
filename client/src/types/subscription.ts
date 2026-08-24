export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'paused';

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  billingCycle: BillingCycle;
  renewalDate: string; // 'YYYY-MM-DD'
  status: SubscriptionStatus;
  category?: string;
  createdAt: string;
  updatedAt: string;
  normalizedMonthlyCost: number;
  daysRemaining: number;
  isRenewingSoon: boolean;
  urgencyBadgeText?: string;
}

export interface DashboardMetrics {
  totalMonthlyBurnRate: number;
  pausedMonthlySavings: number;
  upcomingRenewalsAlertCount: number;
  activeCount: number;
  pausedCount: number;
  totalCount: number;
  annualBurnRate: number;
}

export interface CreateSubscriptionInput {
  name: string;
  cost: number;
  billingCycle: BillingCycle;
  renewalDate: string;
  status?: SubscriptionStatus;
  category?: string;
}
