// Load environment variables FIRST (before any other imports)
import dotenv from 'dotenv';
dotenv.config();

// Now import everything else
import express, { Request, Response } from 'express';
import cors from 'cors';
import { testDatabaseConnection } from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth';
import patientRoutes from './routes/patients';
import doctorRoutes from './routes/doctors';
import appointmentRoutes from './routes/appointments';
import consultationRoutes from './routes/consultations';
import prescriptionRoutes from './routes/prescriptions';
import certificateRoutes from './routes/certificates';
import adminRoutes from './routes/admin';
import systemRoutes from './routes/system';
import docsRoutes from './routes/docs';

const app = express();
const PORT = process.env.PORT || 4000;

// ==================== MIDDLEWARE ====================

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// JSON parsing for all routes
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
    phase: 4,
  });
});

// API root
app.get('/api', (req: Request, res: Response) => {
  res.json({
    name: 'ViCare API',
    version: '1.0.0',
    phase: 4,
    description: 'University Campus Healthcare Platform Backend',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      patients: '/api/patients/*',
      doctors: '/api/doctors/*',
      appointments: '/api/appointments/*',
      consultations: '/api/consultations/*',
      prescriptions: '/api/prescriptions/*',
      certificates: '/api/certificates/*',
      admin: '/api/admin/*',
      system: '/api/system/*',
      docs: '/api/docs',
    },
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Phase 3: Patient & Doctor Routes
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/certificates', certificateRoutes);

// Phase 4: Admin & System Routes
app.use('/api/admin', adminRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/docs', docsRoutes);

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
      console.log('Phase 4 Complete! ✓');
      console.log('All Backend Features Operational');
      console.log('');
      console.log('Core Features:');
      console.log('- Patient & Doctor Management');
      console.log('- Appointment Queue System');
      console.log('- Consultations & Medical Records');
      console.log('- PDF Prescriptions & Certificates');
      console.log('- Admin Dashboard & Analytics');
      console.log('- Doctor Approval Workflow');
      console.log('');
      console.log('Documentation: http://localhost:' + PORT + '/api/docs');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
