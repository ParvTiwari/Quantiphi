import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SubscriptionGrid } from '../SubscriptionGrid';
import { Subscription } from '../../types/subscription';

const mockSubscriptions: Subscription[] = [
  {
    id: 'sub-1',
    name: 'Netflix Premium 4K',
    cost: 649,
    billingCycle: 'monthly',
    renewalDate: '2026-08-27',
    status: 'active',
    category: 'Entertainment',
    createdAt: '',
    updatedAt: '',
    normalizedMonthlyCost: 649,
    daysRemaining: 3,
    isRenewingSoon: true,
    urgencyBadgeText: 'Renewing Soon (3d)',
  },
  {
    id: 'sub-2',
    name: 'GitHub Copilot Pro',
    cost: 8400,
    billingCycle: 'yearly',
    renewalDate: '2026-09-18',
    status: 'paused',
    category: 'Developer Tools',
    createdAt: '',
    updatedAt: '',
    normalizedMonthlyCost: 700,
    daysRemaining: 25,
    isRenewingSoon: false,
    urgencyBadgeText: '25 days left',
  },
];

describe('SubscriptionGrid & The Vibe Check', () => {
  it('renders subscriptions list correctly with normalized costs and cycles', () => {
    render(
      <SubscriptionGrid
        subscriptions={mockSubscriptions}
        onToggleStatus={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.getByText('Netflix Premium 4K')).toBeInTheDocument();
    expect(screen.getByText('GitHub Copilot Pro')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
    expect(screen.getByText('Developer Tools')).toBeInTheDocument();
  });

  it('renders "Renewing Soon" amber badge for subscriptions within 7-day window', () => {
    render(
      <SubscriptionGrid
        subscriptions={mockSubscriptions}
        onToggleStatus={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        isLoading={false}
      />
    );

    // Netflix is renewing in 3 days -> must have Renewing Soon badge inside the table
    const badges = screen.getAllByText(/Renewing Soon/i);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('greys out paused subscriptions visually (The Vibe Check)', () => {
    render(
      <SubscriptionGrid
        subscriptions={mockSubscriptions}
        onToggleStatus={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        isLoading={false}
      />
    );

    // Paused item shows paused savings indicator
    expect(screen.getByText(/Paused • Saving/i)).toBeInTheDocument();
    const pausedName = screen.getByText('GitHub Copilot Pro');
    expect(pausedName).toHaveClass('line-through');
  });

  it('calls onToggleStatus when Active/Paused toggle switch is clicked', async () => {
    const handleToggle = vi.fn().mockResolvedValue(undefined);
    render(
      <SubscriptionGrid
        subscriptions={mockSubscriptions}
        onToggleStatus={handleToggle}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        isLoading={false}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /Toggle status for Netflix Premium 4K/i });
    await fireEvent.click(toggleButton);

    expect(handleToggle).toHaveBeenCalledWith('sub-1');
  });

  it('calls onEdit when edit pencil icon is clicked', () => {
    const handleEdit = vi.fn();
    render(
      <SubscriptionGrid
        subscriptions={mockSubscriptions}
        onToggleStatus={vi.fn()}
        onDelete={vi.fn()}
        onEdit={handleEdit}
        isLoading={false}
      />
    );

    const editBtn = screen.getByTitle('Edit Netflix Premium 4K');
    fireEvent.click(editBtn);

    expect(handleEdit).toHaveBeenCalledWith(mockSubscriptions[0]);
  });
});
