import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend directory
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Environment configuration interface
interface EnvironmentConfig {
  // Server Configuration
  port: number;
  nodeEnv: string;
  
  // Database Configuration
  mongodbUri: string;
  mongodbTestUri: string;
  
  // JWT Configuration
  jwtSecret: string;
  jwtExpiresIn: string;
  
  // Google Gemini API Configuration
  googleApiKey: string;
  
  // CORS Configuration
  frontendUrl: string;
  
  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  
  // Logging
  logLevel: string;
  
  // AI Service Configuration
  aiTemperature: number;
  aiMaxOutputTokens: number;
  
  // XP System Configuration
  xpPerLevel: number;
  maxLevel: number;
}

// Validate required environment variables
const validateEnvironment = (): void => {
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET'
    // Note: GOOGLE_API_KEY is optional - AI features will use fallback if not set
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  // Warn if GOOGLE_API_KEY is missing (non-fatal)
  if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY.trim().length === 0) {
    console.warn('⚠️  WARNING: GOOGLE_API_KEY is not set. AI features will be disabled.');
    console.warn('⚠️  To enable AI-generated meal/workout plans, add GOOGLE_API_KEY to your .env file');
  } else {
    console.log('✅ GOOGLE_API_KEY is configured');
  }
};

// Validate environment variables
validateEnvironment();

// Create environment configuration
const config: EnvironmentConfig = {
  // Server Configuration
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  mongodbUri: process.env.MONGODB_URI!,
  mongodbTestUri: process.env.MONGODB_TEST_URI || process.env.MONGODB_URI!,
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Google Gemini API Configuration
  googleApiKey: process.env.GOOGLE_API_KEY!,
  
  // CORS Configuration
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // AI Service Configuration
  aiTemperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  aiMaxOutputTokens: parseInt(process.env.AI_MAX_OUTPUT_TOKENS || '2048', 10),
  
  // XP System Configuration
  xpPerLevel: parseInt(process.env.XP_PER_LEVEL || '100', 10),
  maxLevel: parseInt(process.env.MAX_LEVEL || '100', 10)
};

// Validate configuration values
const validateConfig = (): void => {
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

// Validate configuration
validateConfig();

export default config;
