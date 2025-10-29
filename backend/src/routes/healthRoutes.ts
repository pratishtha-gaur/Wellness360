import express from 'express';
import { Request, Response } from 'express';
import { database } from '@/config/database';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types';

const router = express.Router();

// Health check endpoint
router.get('/', async (req: Request, res: Response<ApiResponse>) => {
  try {
    const dbHealth = await database.healthCheck();
    const serverUptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(serverUptime / 60)} minutes`,
      database: dbHealth ? 'connected' : 'disconnected',
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };

    res.json({
      success: true,
      message: 'Health check successful',
      data: healthStatus
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      error: 'Service unavailable'
    });
  }
});

// Database health check
router.get('/database', async (req: Request, res: Response<ApiResponse>) => {
  try {
    const isHealthy = await database.healthCheck();
    
    if (isHealthy) {
      res.json({
        success: true,
        message: 'Database is healthy',
        data: {
          status: 'connected',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Database is unhealthy',
        error: 'Database connection failed'
      });
    }
  } catch (error) {
    logger.error('Database health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Database health check failed',
      error: 'Database unavailable'
    });
  }
});

// Server metrics
router.get('/metrics', (req: Request, res: Response<ApiResponse>) => {
  try {
    const metrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Server metrics retrieved successfully',
      data: metrics
    });
  } catch (error) {
    logger.error('Failed to retrieve server metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve server metrics',
      error: 'Internal server error'
    });
  }
});

export default router;
