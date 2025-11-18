import dotenv from 'dotenv';
dotenv.config();

import { Pool, PoolConfig } from 'pg';

const poolConfig: PoolConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'codeslabs_db',
  user: process.env.POSTGRES_USER || 'codeslabs_user',
  password: process.env.POSTGRES_PASSWORD || '',
  ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT || '30000'),
  query_timeout: parseInt(process.env.POSTGRES_QUERY_TIMEOUT || '30000'),
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
};

// Crear pool de conexiones
export const pool = new Pool(poolConfig);

// Manejar errores del pool
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
});

// Función para verificar la conexión
export async function testConnection(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL exitosa:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error);
    return false;
  }
}

// Función para cerrar el pool (útil para tests o shutdown)
export async function closePool(): Promise<void> {
  await pool.end();
  console.log('🔌 Pool de conexiones cerrado');
}

