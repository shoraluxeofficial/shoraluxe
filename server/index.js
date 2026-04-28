import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/paymentRoutes.js';
import shippingRoutes from './routes/shippingRoutes.js';
import { oauthStart, oauthCallback } from './controllers/authController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Log incoming requests to help debug routing
app.use((req, res, next) => {
  console.log('Incoming request ->', req.method, req.originalUrl);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/shipping', shippingRoutes);

// Fallback direct routes (ensure OAuth endpoints are available)
app.get('/api/auth/oauth/google', oauthStart);
app.get('/api/auth/oauth/google/callback', oauthCallback);
// Debug: print authRoutes registered paths
try {
  const authPaths = authRoutes.stack ? authRoutes.stack.map((s) => s.route && s.route.path).filter(Boolean) : [];
  console.log('Auth router paths:', authPaths);
} catch (err) {
  console.warn('Failed to list auth routes:', err.message);
}
// Print app router stack for debugging
try {
  if (app._router && app._router.stack) {
    console.log('App router stack length:', app._router.stack.length);
    app._router.stack.forEach((m, i) => {
      console.log(i, 'name:', m.name, 'path:', m.route && m.route.path, 'methods:', m.route && m.route.methods, 'regexp:', m.regexp && m.regexp.source);
    });
  } else {
    console.log('App router stack missing');
  }
} catch (e) {
  console.warn('Cannot read app._router.stack yet');
}

app.get('/', (req, res) => {
  res.send('Shoraluxe Auth API');
});

// quick test route
app.get('/api/auth/hello', (req, res) => res.send('hello auth'));

// quick non-api test
app.get('/hello2', (req, res) => res.send('hello2'));

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
