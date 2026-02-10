import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
 // Server configuration
 port: process.env.PORT || 3000,
 nodeEnv: process.env.NODE_ENV || 'development',

 // Database configuration
 database: {
  url: process.env.DATABASE_URL,
 },

 // JWT configuration (merged comprehensive)
 jwt: {
  accessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'your-access-secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
  accessExpiry: process.env.JWT_ACCESS_EXPIRY || process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
 },

 // CORS configuration (enhanced)
 cors: {
  origin: [
   'http://localhost:3000',        // Local backend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
 },


 // Rate limiting configuration
 rateLimit: {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
 },
};

// Validate required environment variables
const requiredEnvVars = [
 'MONGO_URI',
 'JWT_ACCESS_SECRET',
 'JWT_REFRESH_SECRET',
 'CORS_ORIGIN'
];

for (const envVar of requiredEnvVars) {
 if (!process.env[envVar] && !process.env[envVar.replace('JWT_', 'JWT_SECRET')]) {
  console.warn(`Missing recommended environment variable: ${envVar}`);
 }
}

console.log(`Config loaded for ${config.nodeEnv} environment`);
console.log(`CORS origins: ${Array.isArray(config.cors.origin) ? config.cors.origin.join(', ') : config.cors.origin}`);
