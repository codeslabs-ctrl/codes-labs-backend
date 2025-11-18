// Cargar variables de entorno PRIMERO, antes de cualquier import que use process.env
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { contactRoutes } from './routes/contact.routes';
import { projectRoutes } from './routes/project.routes';
import { companyValueRoutes } from './routes/company-value.routes';
import { errorHandler } from './middleware/errorHandler.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';
import { testConnection } from './config/database.config';

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Ajustar según necesidades
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // límite de 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:4200'];

// Agregar orígenes de producción si no están incluidos
const productionOrigins = [
  'https://codes-labs.com',
  'https://www.codes-labs.com',
  'http://codes-labs.com',
  'http://www.codes-labs.com'
];

productionOrigins.forEach(origin => {
  if (!allowedOrigins.includes(origin)) {
    allowedOrigins.push(origin);
  }
});

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🌐 CORS Request from origin: ${origin}`);
      console.log(`✅ Allowed origins:`, allowedOrigins);
    }
    
    if (allowedOrigins.includes(origin)) {
      // Devolver el origen específico, no true
      callback(null, origin);
    } else {
      console.warn(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (_req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Codes-Labs API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/contact`, contactRoutes);
app.use(`/api/${apiVersion}/projects`, projectRoutes);
app.use(`/api/${apiVersion}/company-values`, companyValueRoutes);

// Error handling middleware (debe ir al final)
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
async function startServer() {
  // Verificar conexión a la base de datos
  await testConnection();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:4200'}`);
    console.log(`📡 API Version: ${apiVersion}`);
  });
}

startServer().catch((error) => {
  console.error('❌ Error al iniciar el servidor:', error);
  process.exit(1);
});

export default app;

