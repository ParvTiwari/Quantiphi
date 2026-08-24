import { describe, it, expect } from 'vitest';
import { CostUniformityEngine } from '../costEngine.js';
import { Subscription } from '../../types/subscription.js';

describe('CostUniformityEngine', () => {
  describe('normalizeMonthlyCost', () => {
    it('should return the original cost for monthly subscriptions', () => {
      expect(CostUniformityEngine.normalizeMonthlyCost(15.99, 'monthly')).toBe(15.99);
      expect(CostUniformityEngine.normalizeMonthlyCost(0, 'monthly')).toBe(0);
      expect(CostUniformityEngine.normalizeMonthlyCost(49.95, 'monthly')).toBe(49.95);
    });

    it('should divide yearly subscriptions by 12 and round to 2 decimal places', () => {
      // $120 / 12 = $10.00
      expect(CostUniformityEngine.normalizeMonthlyCost(120, 'yearly')).toBe(10);
      // $100 / 12 = $8.3333... -> $8.33
      expect(CostUniformityEngine.normalizeMonthlyCost(100, 'yearly')).toBe(8.33);
      // $96 / 12 = $8.00
      expect(CostUniformityEngine.normalizeMonthlyCost(96, 'yearly')).toBe(8);
      // $59.88 / 12 = $4.99
      expect(CostUniformityEngine.normalizeMonthlyCost(59.88, 'yearly')).toBe(4.99);
    });

    it('should handle zero, negative, and NaN gracefully', () => {
      expect(CostUniformityEngine.normalizeMonthlyCost(-10, 'monthly')).toBe(0);
      expect(CostUniformityEngine.normalizeMonthlyCost(NaN, 'yearly')).toBe(0);
    });
  });

  describe('calculateFinancialMetrics', () => {
    const mockSubscriptions: Subscription[] = [
      {
        id: '1',
        name: 'Netflix',
        cost: 15.00,
        billingCycle: 'monthly',
        renewalDate: '2026-08-30',
        status: 'active',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        name: 'AWS',
        cost: 120.00, // $10/mo
        billingCycle: 'yearly',
        renewalDate: '2026-09-15',
        status: 'active',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '3',
        name: 'GitHub Copilot',
        cost: 100.00, // $8.33/mo
        billingCycle: 'yearly',
        renewalDate: '2026-09-20',
        status: 'paused', // Excluded from burn rate
        createdAt: '',
        updatedAt: '',
      },
    ];

    it('should calculate active burn rate and exclude paused subscriptions', () => {
      const metrics = CostUniformityEngine.calculateFinancialMetrics(mockSubscriptions);

      // Active = Netflix ($15) + AWS ($10) = $25.00
      expect(metrics.totalMonthlyBurnRate).toBe(25.00);
      // Paused = GitHub Copilot ($8.33)
      expect(metrics.pausedMonthlySavings).toBe(8.33);
      expect(metrics.activeCount).toBe(2);
      expect(metrics.pausedCount).toBe(1);
      expect(metrics.annualBurnRate).toBe(300.00); // $25 * 12
    });

    it('should recalculate correctly when a subscription is paused', () => {
      const allPaused: Subscription[] = mockSubscriptions.map(s => ({ ...s, status: 'paused' }));
      const metrics = CostUniformityEngine.calculateFinancialMetrics(allPaused);

      expect(metrics.totalMonthlyBurnRate).toBe(0);
      expect(metrics.pausedMonthlySavings).toBe(33.33); // 15 + 10 + 8.33
      expect(metrics.activeCount).toBe(0);
      expect(metrics.pausedCount).toBe(3);
    });
  });
});
