import { Subscription, EnrichedSubscription, DashboardMetrics, CreateSubscriptionInput } from '../types/subscription.js';
import { CostUniformityEngine } from '../services/costEngine.js';
import { DateIntersectCalculator } from '../services/dateCalculator.js';

// Helper to generate dynamic seed dates relative to current date
function offsetDateString(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export class SubscriptionStore {
  private subscriptions: Map<string, Subscription> = new Map();

  constructor() {
    this.seedDefaultData();
  }

  public seedDefaultData(): void {
    this.subscriptions.clear();
    const seedData: Omit<Subscription, 'createdAt' | 'updatedAt'>[] = [
      {
        id: 'sub_1',
        name: 'Netflix Premium 4K',
        cost: 649.00,
        billingCycle: 'monthly',
        renewalDate: offsetDateString(3), // In 3 days -> "Renewing Soon"
        status: 'active',
        category: 'Entertainment',
      },
      {
        id: 'sub_2',
        name: 'Spotify Premium',
        cost: 119.00,
        billingCycle: 'monthly',
        renewalDate: offsetDateString(18), // In 18 days
        status: 'active',
        category: 'Music & Audio',
      },
      {
        id: 'sub_3',
        name: 'AWS Cloud Hosting',
        cost: 9600.00,
        billingCycle: 'yearly', // Yearly ₹9600 -> ₹800.00/mo
        renewalDate: offsetDateString(5), // In 5 days -> "Renewing Soon"
        status: 'active',
        category: 'Cloud & Infra',
      },
      {
        id: 'sub_4',
        name: 'GitHub Copilot Pro',
        cost: 8400.00,
        billingCycle: 'yearly', // Yearly ₹8400 -> ₹700.00/mo
        renewalDate: offsetDateString(25),
        status: 'paused', // Paused to test vibe check savings
        category: 'Developer Tools',
      },
      {
        id: 'sub_5',
        name: 'Figma Professional',
        cost: 1250.00,
        billingCycle: 'monthly',
        renewalDate: offsetDateString(12),
        status: 'active',
        category: 'Design',
      },
      {
        id: 'sub_6',
        name: 'Notion Team Plus',
        cost: 7800.00,
        billingCycle: 'yearly', // Yearly ₹7800 -> ₹650.00/mo
        renewalDate: offsetDateString(6), // In 6 days -> "Renewing Soon"
        status: 'active',
        category: 'Productivity',
      },
    ];

    const now = new Date().toISOString();
    for (const item of seedData) {
      this.subscriptions.set(item.id, {
        ...item,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  public getAll(): EnrichedSubscription[] {
    const list = Array.from(this.subscriptions.values());
    return list.map(sub => this.enrichSubscription(sub));
  }

  public getById(id: string): EnrichedSubscription | null {
    const sub = this.subscriptions.get(id);
    return sub ? this.enrichSubscription(sub) : null;
  }

  public create(input: CreateSubscriptionInput): EnrichedSubscription {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newSub: Subscription = {
      id,
      name: input.name.trim(),
      cost: Number(input.cost),
      billingCycle: input.billingCycle,
      renewalDate: input.renewalDate,
      status: input.status || 'active',
      category: input.category || 'General',
      createdAt: now,
      updatedAt: now,
    };

    this.subscriptions.set(id, newSub);
    return this.enrichSubscription(newSub);
  }

  public toggleStatus(id: string): EnrichedSubscription | null {
    const sub = this.subscriptions.get(id);
    if (!sub) return null;

    const newStatus = sub.status === 'active' ? 'paused' : 'active';
    const updated: Subscription = {
      ...sub,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    this.subscriptions.set(id, updated);
    return this.enrichSubscription(updated);
  }

  public update(id: string, updates: Partial<CreateSubscriptionInput>): EnrichedSubscription | null {
    const sub = this.subscriptions.get(id);
    if (!sub) return null;

    const updated: Subscription = {
      ...sub,
      ...(updates.name !== undefined && { name: updates.name.trim() }),
      ...(updates.cost !== undefined && { cost: Number(updates.cost) }),
      ...(updates.billingCycle !== undefined && { billingCycle: updates.billingCycle }),
      ...(updates.renewalDate !== undefined && { renewalDate: updates.renewalDate }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.category !== undefined && { category: updates.category }),
      updatedAt: new Date().toISOString(),
    };

    this.subscriptions.set(id, updated);
    return this.enrichSubscription(updated);
  }

  public delete(id: string): boolean {
    return this.subscriptions.delete(id);
  }

  public getMetrics(): DashboardMetrics {
    const subs = Array.from(this.subscriptions.values());
    const financial = CostUniformityEngine.calculateFinancialMetrics(subs);

    const upcomingRenewalsAlertCount = subs.filter(sub => {
      if (sub.status !== 'active') return false;
      return DateIntersectCalculator.isRenewingSoon(sub.renewalDate);
    }).length;

    return {
      totalMonthlyBurnRate: financial.totalMonthlyBurnRate,
      pausedMonthlySavings: financial.pausedMonthlySavings,
      upcomingRenewalsAlertCount,
      activeCount: financial.activeCount,
      pausedCount: financial.pausedCount,
      totalCount: subs.length,
      annualBurnRate: financial.annualBurnRate,
    };
  }

  private enrichSubscription(sub: Subscription): EnrichedSubscription {
    const normalizedMonthlyCost = CostUniformityEngine.normalizeMonthlyCost(sub.cost, sub.billingCycle);
    const daysRemaining = DateIntersectCalculator.calculateDaysRemaining(sub.renewalDate);
    const isRenewingSoon = DateIntersectCalculator.isRenewingSoon(sub.renewalDate);
    const urgencyBadgeText = DateIntersectCalculator.getUrgencyBadgeText(daysRemaining);

    return {
      ...sub,
      normalizedMonthlyCost,
      daysRemaining,
      isRenewingSoon,
      urgencyBadgeText,
    };
  }
}

export const subscriptionStore = new SubscriptionStore();
