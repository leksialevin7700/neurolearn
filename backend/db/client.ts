import { Pool } from 'pg';

// PostgreSQL connection configuration
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'analytics',
  password: process.env.POSTGRES_PASSWORD || 'analytics123',
  database: process.env.POSTGRES_DB || 'learning_platform',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('✗ PostgreSQL pool error:', err);
});

export { pool };
export default pool;
