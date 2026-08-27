import express from 'express';
import cors from 'cors';
import subscriptionRoutes from './routes/subscriptions.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins in production / Vercel
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());

// Root health & status check for Vercel backend verification
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'SubPulse API Server',
    endpoints: {
      subscriptions: '/api/subscriptions',
      metrics: '/api/subscriptions/metrics',
      health: '/api/health',
    },
  });
});

// API Routes
app.use('/api/subscriptions', subscriptionRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Subscription Tracker API',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Subscription Tracker API server running at http://localhost:${PORT}`);
  });
}

export default app;
