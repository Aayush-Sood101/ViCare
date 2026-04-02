import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
import { clerkAuthMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Public health check
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Detailed health check (admin only)
router.get('/health/detailed', clerkAuthMiddleware, requireRole('admin'), asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();

  // Check database connection
  let dbStatus = 'ok';
  let dbLatency = 0;
  try {
    const dbStart = Date.now();
    await supabase.from('patients').select('id').limit(1);
    dbLatency = Date.now() - dbStart;
  } catch (error) {
    dbStatus = 'error';
  }

  // Check storage
  let storageStatus = 'ok';
  try {
    await supabase.storage.from('documents').list('', { limit: 1 });
  } catch (error) {
    storageStatus = 'error';
  }

  const totalLatency = Date.now() - startTime;

  return res.json({
    status: dbStatus === 'ok' && storageStatus === 'ok' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: dbStatus, latencyMs: dbLatency },
      storage: { status: storageStatus },
    },
    totalLatencyMs: totalLatency,
  });
}));

export default router;
