import { Router, Request, Response } from 'express';
import { subscriptionStore } from '../data/subscriptionStore.js';
import { CreateSubscriptionInput, BillingCycle, SubscriptionStatus } from '../types/subscription.js';

const router = Router();

// Helper to safely get route parameter as string
const getParamId = (req: Request): string => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : (id || '');
};

// GET all subscriptions (enriched with normalized rates & renewal status)
router.get('/', (_req: Request, res: Response) => {
  const subscriptions = subscriptionStore.getAll();
  res.json({
    success: true,
    data: subscriptions,
  });
});

// GET dashboard metrics
router.get('/metrics', (_req: Request, res: Response) => {
  const metrics = subscriptionStore.getMetrics();
  res.json({
    success: true,
    data: metrics,
  });
});

// GET single subscription by ID
router.get('/:id', (req: Request, res: Response): void => {
  const sub = subscriptionStore.getById(getParamId(req));
  if (!sub) {
    res.status(404).json({ success: false, error: 'Subscription not found' });
    return;
  }
  res.json({ success: true, data: sub });
});

// POST create new subscription
router.post('/', (req: Request, res: Response): void => {
  const { name, cost, billingCycle, renewalDate, status, category } = req.body as Partial<CreateSubscriptionInput>;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ success: false, error: 'Service name is required' });
    return;
  }

  const numericCost = Number(cost);
  if (isNaN(numericCost) || numericCost < 0) {
    res.status(400).json({ success: false, error: 'Cost must be a valid non-negative number' });
    return;
  }

  if (billingCycle !== 'monthly' && billingCycle !== 'yearly') {
    res.status(400).json({ success: false, error: "Billing cycle must be either 'monthly' or 'yearly'" });
    return;
  }

  if (!renewalDate || isNaN(Date.parse(renewalDate))) {
    res.status(400).json({ success: false, error: 'Valid renewal date is required (YYYY-MM-DD)' });
    return;
  }

  const validatedStatus: SubscriptionStatus = status === 'paused' ? 'paused' : 'active';

  const newSub = subscriptionStore.create({
    name,
    cost: numericCost,
    billingCycle: billingCycle as BillingCycle,
    renewalDate,
    status: validatedStatus,
    category,
  });

  const updatedMetrics = subscriptionStore.getMetrics();

  res.status(201).json({
    success: true,
    data: newSub,
    metrics: updatedMetrics,
  });
});

// PATCH toggle active / paused status ("The Vibe Check" state toggle)
router.patch('/:id/toggle', (req: Request, res: Response): void => {
  const updated = subscriptionStore.toggleStatus(getParamId(req));
  if (!updated) {
    res.status(404).json({ success: false, error: 'Subscription not found' });
    return;
  }

  const updatedMetrics = subscriptionStore.getMetrics();

  res.json({
    success: true,
    data: updated,
    metrics: updatedMetrics,
  });
});

// PUT update subscription
router.put('/:id', (req: Request, res: Response): void => {
  const { name, cost, billingCycle, renewalDate, status, category } = req.body as Partial<CreateSubscriptionInput>;

  const updated = subscriptionStore.update(getParamId(req), {
    ...(name && { name }),
    ...(cost !== undefined && { cost: Number(cost) }),
    ...(billingCycle && { billingCycle: billingCycle as BillingCycle }),
    ...(renewalDate && { renewalDate }),
    ...(status && { status: status as SubscriptionStatus }),
    ...(category && { category }),
  });

  if (!updated) {
    res.status(404).json({ success: false, error: 'Subscription not found' });
    return;
  }

  const updatedMetrics = subscriptionStore.getMetrics();

  res.json({
    success: true,
    data: updated,
    metrics: updatedMetrics,
  });
});

// DELETE remove subscription
router.delete('/:id', (req: Request, res: Response): void => {
  const success = subscriptionStore.delete(getParamId(req));
  if (!success) {
    res.status(404).json({ success: false, error: 'Subscription not found' });
    return;
  }

  const updatedMetrics = subscriptionStore.getMetrics();

  res.json({
    success: true,
    message: 'Subscription deleted successfully',
    metrics: updatedMetrics,
  });
});

// POST reset to seed demo data
router.post('/reset', (_req: Request, res: Response) => {
  subscriptionStore.seedDefaultData();
  res.json({
    success: true,
    data: subscriptionStore.getAll(),
    metrics: subscriptionStore.getMetrics(),
  });
});

export default router;
