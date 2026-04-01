import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testDatabaseConnection } from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Routes
import webhookRoutes from './routes/webhooks';
import authRoutes from './routes/auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ==================== MIDDLEWARE ====================

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Webhook routes BEFORE JSON parser (needs raw body for signature verification)
app.use('/api/webhooks', express.json({ verify: (req: any, res, buf) => { req.rawBody = buf; } }), webhookRoutes);

// JSON parsing for all other routes
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== ROUTES ====================

// Health check endpoint (public)
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    phase: 2,
  });
});

// API root
app.get('/api', (req: Request, res: Response) => {
  res.json({
    name: 'ViCare API',
    version: '1.0.0',
    phase: 2,
    description: 'University Campus Healthcare Platform Backend',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      webhooks: '/api/webhooks/clerk',
    },
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Catch-all for undefined routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    message: 'The requested endpoint does not exist',
  });
});

// ==================== ERROR HANDLING ====================

app.use(errorHandler);

// ==================== SERVER STARTUP ====================

async function startServer() {
  try {
    // Test database connection
    console.log('Testing database connection...');
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      console.warn('⚠ Warning: Database connection failed. Server will start but may not function properly.');
    }

    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('  ViCare API Server');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`  Status:        Running`);
      console.log(`  Port:          ${PORT}`);
      console.log(`  Environment:   ${process.env.NODE_ENV || 'development'}`);
      console.log(`  URL:           http://localhost:${PORT}`);
      console.log(`  Health Check:  http://localhost:${PORT}/health`);
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      console.log('Phase 1 Setup Complete! ✓');
      console.log('');
      console.log('Next Steps:');
      console.log('1. Run the database/init.sql file in Supabase SQL Editor');
      console.log('2. Create a "documents" storage bucket in Supabase (private)');
      console.log('3. Configure Clerk JWT template and webhook');
      console.log('4. Proceed to Phase 2 implementation');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
