import { describe, it, expect } from 'vitest';
import { DateIntersectCalculator } from '../dateCalculator.js';

describe('DateIntersectCalculator', () => {
  const fixedToday = new Date(2026, 7, 24); // Aug 24, 2026 (month is 0-indexed: 7 = August)

  describe('calculateDaysRemaining', () => {
    it('should return 0 for renewal today', () => {
      expect(DateIntersectCalculator.calculateDaysRemaining('2026-08-24', fixedToday)).toBe(0);
    });

    it('should return 1 for renewal tomorrow', () => {
      expect(DateIntersectCalculator.calculateDaysRemaining('2026-08-25', fixedToday)).toBe(1);
    });

    it('should return 7 for renewal in exactly 7 days', () => {
      expect(DateIntersectCalculator.calculateDaysRemaining('2026-08-31', fixedToday)).toBe(7);
    });

    it('should return negative days for past renewal date', () => {
      expect(DateIntersectCalculator.calculateDaysRemaining('2026-08-20', fixedToday)).toBe(-4);
    });

    it('should cross month boundaries correctly', () => {
      // Aug 24 to Sep 5 = 7 (Aug 24 to 31) + 5 = 12 days
      expect(DateIntersectCalculator.calculateDaysRemaining('2026-09-05', fixedToday)).toBe(12);
    });
  });

  describe('isRenewingSoon (7-day caution window)', () => {
    it('should return true for dates within 0 to 7 days', () => {
      expect(DateIntersectCalculator.isRenewingSoon('2026-08-24', fixedToday)).toBe(true); // today (0d)
      expect(DateIntersectCalculator.isRenewingSoon('2026-08-27', fixedToday)).toBe(true); // 3d
      expect(DateIntersectCalculator.isRenewingSoon('2026-08-31', fixedToday)).toBe(true); // 7d
    });

    it('should return false for dates beyond 7 days', () => {
      expect(DateIntersectCalculator.isRenewingSoon('2026-09-01', fixedToday)).toBe(false); // 8d
      expect(DateIntersectCalculator.isRenewingSoon('2026-09-15', fixedToday)).toBe(false); // 22d
    });

    it('should return false for dates in the past', () => {
      expect(DateIntersectCalculator.isRenewingSoon('2026-08-23', fixedToday)).toBe(false); // -1d
    });
  });

  describe('getUrgencyBadgeText', () => {
    it('should format badge text properly', () => {
      expect(DateIntersectCalculator.getUrgencyBadgeText(0)).toBe('Renews Today');
      expect(DateIntersectCalculator.getUrgencyBadgeText(1)).toBe('Renews Tomorrow');
      expect(DateIntersectCalculator.getUrgencyBadgeText(5)).toBe('Renewing Soon (5d)');
      expect(DateIntersectCalculator.getUrgencyBadgeText(15)).toBe('15 days left');
      expect(DateIntersectCalculator.getUrgencyBadgeText(-2)).toBe('Overdue (2d)');
    });
  });
});
