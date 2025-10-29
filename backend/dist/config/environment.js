"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const validateEnvironment = () => {
    const requiredVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'GOOGLE_API_KEY'
    ];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
};
validateEnvironment();
const config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodbUri: process.env.MONGODB_URI,
    mongodbTestUri: process.env.MONGODB_TEST_URI || process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    googleApiKey: process.env.GOOGLE_API_KEY,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
    aiTemperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    aiMaxOutputTokens: parseInt(process.env.AI_MAX_OUTPUT_TOKENS || '2048', 10),
    xpPerLevel: parseInt(process.env.XP_PER_LEVEL || '100', 10),
    maxLevel: parseInt(process.env.MAX_LEVEL || '100', 10)
};
const validateConfig = () => {
    if (config.port < 1 || config.port > 65535) {
        throw new Error('Invalid PORT: must be between 1 and 65535');
    }
    if (!['development', 'production', 'test'].includes(config.nodeEnv)) {
        throw new Error('Invalid NODE_ENV: must be development, production, or test');
    }
    if (config.rateLimitWindowMs < 1000) {
        throw new Error('Invalid RATE_LIMIT_WINDOW_MS: must be at least 1000ms');
    }
    if (config.rateLimitMaxRequests < 1) {
        throw new Error('Invalid RATE_LIMIT_MAX_REQUESTS: must be at least 1');
    }
    if (config.aiTemperature < 0 || config.aiTemperature > 2) {
        throw new Error('Invalid AI_TEMPERATURE: must be between 0 and 2');
    }
    if (config.aiMaxOutputTokens < 1 || config.aiMaxOutputTokens > 8192) {
        throw new Error('Invalid AI_MAX_OUTPUT_TOKENS: must be between 1 and 8192');
    }
    if (config.xpPerLevel < 1) {
        throw new Error('Invalid XP_PER_LEVEL: must be at least 1');
    }
    if (config.maxLevel < 1 || config.maxLevel > 1000) {
        throw new Error('Invalid MAX_LEVEL: must be between 1 and 1000');
    }
};
validateConfig();
exports.default = config;
//# sourceMappingURL=environment.js.map