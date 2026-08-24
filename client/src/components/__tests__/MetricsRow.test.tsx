import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricsRow } from '../MetricsRow';
import { DashboardMetrics } from '../../types/subscription';

describe('MetricsRow Component', () => {
  const mockMetrics: DashboardMetrics = {
    totalMonthlyBurnRate: 1449.00,
    pausedMonthlySavings: 700.00,
    upcomingRenewalsAlertCount: 2,
    activeCount: 4,
    pausedCount: 1,
    totalCount: 5,
    annualBurnRate: 17388.00,
  };

  it('renders Total Monthly Burn Rate formatted in ₹ INR', () => {
    render(<MetricsRow metrics={mockMetrics} isLoading={false} />);

    expect(screen.getByText(/Total Monthly Burn Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/1,449.00/i)).toBeInTheDocument();
    expect(screen.getByText(/4 Active/i)).toBeInTheDocument();
  });

  it('renders Paused Monthly Savings simulation and annual projection', () => {
    render(<MetricsRow metrics={mockMetrics} isLoading={false} />);

    expect(screen.getByText(/Paused Savings:/i)).toBeInTheDocument();
    expect(screen.getByText(/700.00\/mo/i)).toBeInTheDocument();
    expect(screen.getByText(/17,388.00\/yr/i)).toBeInTheDocument();
  });

  it('renders Upcoming Renewals Alert Count with urgent action badge when count > 0', () => {
    render(<MetricsRow metrics={mockMetrics} isLoading={false} />);

    expect(screen.getByText(/Upcoming Renewals Alert/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/Urgent Action/i)).toBeInTheDocument();
  });

  it('renders "All Clear" badge when upcoming renewals count is 0', () => {
    const zeroMetrics: DashboardMetrics = {
      ...mockMetrics,
      upcomingRenewalsAlertCount: 0,
    };
    render(<MetricsRow metrics={zeroMetrics} isLoading={false} />);

    expect(screen.getByText(/All Clear/i)).toBeInTheDocument();
  });
});
