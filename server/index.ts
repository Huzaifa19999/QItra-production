import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import categoriesRouter from './routes/categories';
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';
import uploadRouter from './routes/upload';
import authRouter from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for web and mobile clients
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'QITRA Haute Maison API Server',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/auth', authRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err?.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`\n══════════════════════════════════════════════════════════`);
  console.log(`  ⚜️  QITRA Haute Maison — Backend API Server`);
  console.log(`  🚀  Listening at: http://localhost:${PORT}`);
  console.log(`  🌐  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`══════════════════════════════════════════════════════════\n`);
});
