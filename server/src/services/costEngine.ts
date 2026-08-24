import { BillingCycle, Subscription, DashboardMetrics } from '../types/subscription.js';

/**
 * Cost Uniformity Engine
 * Normalizes subscription costs of varying billing frequencies down to a standardized monthly rate.
 */
export class CostUniformityEngine {
  /**
   * Normalizes a raw subscription cost to a monthly rate.
   * - Monthly subscriptions: returned as-is (validated >= 0).
   * - Yearly subscriptions: divided by 12 months.
   *
   * @param cost The raw monetary value entered by the user
   * @param cycle The billing cycle ('monthly' or 'yearly')
   * @returns Normalized monthly cost rounded to 2 decimal places
   */
  public static normalizeMonthlyCost(cost: number, cycle: BillingCycle): number {
    if (isNaN(cost) || cost < 0) {
      return 0;
    }

    let monthlyRate: number;
    switch (cycle) {
      case 'yearly':
        monthlyRate = cost / 12;
        break;
      case 'monthly':
      default:
        monthlyRate = cost;
        break;
    }

    // Round to 2 decimal places with float precision safety
    return Math.round((monthlyRate + Number.EPSILON) * 100) / 100;
  }

  /**
   * Calculates the projected annual cost from raw cost and billing cycle.
   */
  public static calculateAnnualCost(cost: number, cycle: BillingCycle): number {
    if (isNaN(cost) || cost < 0) return 0;
    if (cycle === 'yearly') return cost;
    return Math.round((cost * 12 + Number.EPSILON) * 100) / 100;
  }

  /**
   * Aggregates financial metrics across a collection of subscriptions.
   * Dynamically excludes paused subscriptions from the monthly burn rate to simulate savings in real-time.
   */
  public static calculateFinancialMetrics(subscriptions: Subscription[]): {
    totalMonthlyBurnRate: number;
    pausedMonthlySavings: number;
    annualBurnRate: number;
    activeCount: number;
    pausedCount: number;
  } {
    let activeBurn = 0;
    let pausedSavings = 0;
    let activeCount = 0;
    let pausedCount = 0;

    for (const sub of subscriptions) {
      const normalizedCost = this.normalizeMonthlyCost(sub.cost, sub.billingCycle);

      if (sub.status === 'active') {
        activeBurn += normalizedCost;
        activeCount++;
      } else {
        pausedSavings += normalizedCost;
        pausedCount++;
      }
    }

    const roundedBurn = Math.round((activeBurn + Number.EPSILON) * 100) / 100;
    const roundedSavings = Math.round((pausedSavings + Number.EPSILON) * 100) / 100;
    const annualBurn = Math.round((roundedBurn * 12 + Number.EPSILON) * 100) / 100;

    return {
      totalMonthlyBurnRate: roundedBurn,
      pausedMonthlySavings: roundedSavings,
      annualBurnRate: annualBurn,
      activeCount,
      pausedCount,
    };
  }
}
