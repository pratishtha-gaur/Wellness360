// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Import configurations and utilities
import { database } from '@/config/database';
import { logger, morganStream } from '@/utils/logger';
import { errorHandler, handleUnhandledRejection, handleUncaughtException, notFound } from '@/middleware/errorHandler';

// Import routes
import userRoutes from '@/routes/userRoutes';
import goalsRoutes from '@/routes/goalsRoutes';
import wellnessRoutes from '@/routes/wellnessRoutes';
import healthRoutes from '@/routes/healthRoutes';
import xpRoutes from '@/routes/xpRoutes';

class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '5000', 10);
    
    // Initialize server
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev', { stream: morganStream }));
    } else {
      this.app.use(morgan('combined', { stream: morganStream }));
    }

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check route
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Wellness360 API is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    });

    // API routes
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/goals', goalsRoutes);
    this.app.use('/api/wellness', wellnessRoutes);
    this.app.use('/api/health', healthRoutes);
    this.app.use('/api/xp', xpRoutes);

    // 404 handler for undefined routes
    this.app.use('*', notFound);
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use(errorHandler);

    // Handle unhandled promise rejections
    handleUnhandledRejection();

    // Handle uncaught exceptions
    handleUncaughtException();
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await database.connect();

      // Start server
      this.app.listen(this.port, () => {
        logger.info(`🚀 Server running on port ${this.port}`);
        logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`🌐 API URL: http://localhost:${this.port}`);
        logger.info(`📖 Health Check: http://localhost:${this.port}/api/health`);
      });

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      await database.disconnect();
      logger.info('Server stopped gracefully');
      process.exit(0);
    } catch (error) {
      logger.error('Error stopping server:', error);
      process.exit(1);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Create server instance
const server = new Server();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.stop();
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.stop();
});

// Start server
if (require.main === module) {
  server.start();
}

export default server;
