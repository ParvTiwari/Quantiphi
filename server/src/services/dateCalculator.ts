/**
 * Date Intersect Calculator
 * Evaluates parsed calendar string dates against current calendar date
 * to determine days remaining until the next renewal event and flag urgent items (within 7 days).
 */
export class DateIntersectCalculator {
  /**
   * Helper to normalize a Date object to local calendar date midnight (00:00:00.000)
   * avoiding timezone offset bugs.
   */
  public static normalizeToMidnight(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Parses a YYYY-MM-DD date string into a Date object at midnight local time.
   */
  public static parseLocalDate(dateStr: string): Date {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day, 0, 0, 0, 0);
    }
    const fallback = new Date(dateStr);
    return this.normalizeToMidnight(fallback);
  }

  /**
   * Calculates the exact integer number of calendar days between reference date and renewal date.
   *
   * @param renewalDateStr ISO 'YYYY-MM-DD' renewal date string
   * @param referenceDate Optional reference Date (defaults to new Date())
   * @returns Integer days remaining (e.g. 0 for today, 1 for tomorrow, -1 for yesterday)
   */
  public static calculateDaysRemaining(renewalDateStr: string, referenceDate: Date = new Date()): number {
    const ref = this.normalizeToMidnight(referenceDate);
    const target = this.parseLocalDate(renewalDateStr);

    const msPerDay = 1000 * 60 * 60 * 24;
    const diffMs = target.getTime() - ref.getTime();
    return Math.round(diffMs / msPerDay);
  }

  /**
   * Evaluates if a renewal date qualifies for the urgent criteria (falls within 7 days from now).
   * Note: Renewals due today or in the next 7 days (0 <= daysRemaining <= 7) qualify.
   */
  public static isRenewingSoon(renewalDateStr: string, referenceDate: Date = new Date()): boolean {
    const days = this.calculateDaysRemaining(renewalDateStr, referenceDate);
    return days >= 0 && days <= 7;
  }

  /**
   * Returns a user-friendly urgency label based on days remaining.
   */
  public static getUrgencyBadgeText(daysRemaining: number): string {
    if (daysRemaining === 0) return 'Renews Today';
    if (daysRemaining === 1) return 'Renews Tomorrow';
    if (daysRemaining > 1 && daysRemaining <= 7) return `Renewing Soon (${daysRemaining}d)`;
    if (daysRemaining < 0) return `Overdue (${Math.abs(daysRemaining)}d)`;
    return `${daysRemaining} days left`;
  }

  /**
   * Formats a date string for display (e.g. "Sep 04, 2026")
   */
  public static formatDisplayDate(dateStr: string): string {
    try {
      const date = this.parseLocalDate(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }
}
