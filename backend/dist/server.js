"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const database_1 = require("./config/database");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const goalsRoutes_1 = __importDefault(require("./routes/goalsRoutes"));
const wellnessRoutes_1 = __importDefault(require("./routes/wellnessRoutes"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const xpRoutes_1 = __importDefault(require("./routes/xpRoutes"));
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || '5000', 10);
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddlewares() {
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));
        this.app.use((0, cors_1.default)({
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        }));
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
            max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
            message: {
                success: false,
                message: 'Too many requests from this IP, please try again later.',
            },
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use('/api/', limiter);
        this.app.use((0, compression_1.default)());
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        if (process.env.NODE_ENV === 'development') {
            this.app.use((0, morgan_1.default)('dev', { stream: logger_1.morganStream }));
        }
        else {
            this.app.use((0, morgan_1.default)('combined', { stream: logger_1.morganStream }));
        }
        this.app.use((req, res, next) => {
            logger_1.logger.info(`${req.method} ${req.path} - ${req.ip}`);
            next();
        });
    }
    initializeRoutes() {
        this.app.get('/', (req, res) => {
            res.json({
                success: true,
                message: 'Wellness360 API is running!',
                version: '1.0.0',
                timestamp: new Date().toISOString(),
            });
        });
        this.app.use('/api/users', userRoutes_1.default);
        this.app.use('/api/goals', goalsRoutes_1.default);
        this.app.use('/api/wellness', wellnessRoutes_1.default);
        this.app.use('/api/health', healthRoutes_1.default);
        this.app.use('/api/xp', xpRoutes_1.default);
        this.app.use('*', errorHandler_1.notFound);
    }
    initializeErrorHandling() {
        this.app.use(errorHandler_1.errorHandler);
        (0, errorHandler_1.handleUnhandledRejection)();
        (0, errorHandler_1.handleUncaughtException)();
    }
    async start() {
        try {
            await database_1.database.connect();
            this.app.listen(this.port, () => {
                logger_1.logger.info(`🚀 Server running on port ${this.port}`);
                logger_1.logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
                logger_1.logger.info(`🌐 API URL: http://localhost:${this.port}`);
                logger_1.logger.info(`📖 Health Check: http://localhost:${this.port}/api/health`);
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to start server:', error);
            process.exit(1);
        }
    }
    async stop() {
        try {
            await database_1.database.disconnect();
            logger_1.logger.info('Server stopped gracefully');
            process.exit(0);
        }
        catch (error) {
            logger_1.logger.error('Error stopping server:', error);
            process.exit(1);
        }
    }
    getApp() {
        return this.app;
    }
}
const server = new Server();
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received. Shutting down gracefully...');
    server.stop();
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received. Shutting down gracefully...');
    server.stop();
});
if (require.main === module) {
    server.start();
}
exports.default = server;
//# sourceMappingURL=server.js.map