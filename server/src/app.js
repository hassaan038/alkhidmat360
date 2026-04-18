import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import qurbaniModuleRoutes from './routes/qurbaniModuleRoutes.js';
import qurbaniSkinPickupRoutes from './routes/qurbaniSkinPickupRoutes.js';
import configRoutes from './routes/configRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
const MySQLStoreSession = MySQLStore(session);

// Parse DATABASE_URL to get session store connection details
const dbUrl = new URL(process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/alkhidmat360');
const sessionStore = new MySQLStoreSession({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: decodeURIComponent(dbUrl.password), // Decode URL-encoded password
  database: dbUrl.pathname.slice(1), // Remove leading slash
  createDatabaseTable: true,
});

app.use(session({
  key: process.env.SESSION_NAME || 'alkhidmat_sid',
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
}));

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Alkhidmat 360 API Server',
    status: 'running',
    version: '1.0.0',
  });
});

// Static serving for uploaded files (qurbani listing photos, etc.)
app.use(
  '/uploads',
  express.static(path.resolve(__dirname, '../uploads'))
);

// API routes
// Additional routes will be imported here as they are created
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/qurbani-module', qurbaniModuleRoutes);
app.use('/api/qurbani-skin-pickup', qurbaniSkinPickupRoutes);
app.use('/api/config', configRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(Array.isArray(err.errors) && err.errors.length > 0 && { errors: err.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
