"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const dbHealth = await database_1.database.healthCheck();
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
    }
    catch (error) {
        logger_1.logger.error('Health check failed:', error);
        res.status(503).json({
            success: false,
            message: 'Health check failed',
            error: 'Service unavailable'
        });
    }
});
router.get('/database', async (req, res) => {
    try {
        const isHealthy = await database_1.database.healthCheck();
        if (isHealthy) {
            res.json({
                success: true,
                message: 'Database is healthy',
                data: {
                    status: 'connected',
                    timestamp: new Date().toISOString()
                }
            });
        }
        else {
            res.status(503).json({
                success: false,
                message: 'Database is unhealthy',
                error: 'Database connection failed'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Database health check failed:', error);
        res.status(503).json({
            success: false,
            message: 'Database health check failed',
            error: 'Database unavailable'
        });
    }
});
router.get('/metrics', (req, res) => {
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
    }
    catch (error) {
        logger_1.logger.error('Failed to retrieve server metrics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve server metrics',
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=healthRoutes.js.map