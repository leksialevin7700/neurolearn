import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'learning_platform';

let client: MongoClient;
let db: Db;

/**
 * Connect to MongoDB
 */
export async function connectDB(): Promise<Db> {
  if (db) return db;

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log('✓ Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Get the database instance
 */
export function getDB(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
}

/**
 * Close the connection
 */
export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    console.log('✓ MongoDB connection closed');
  }
}

export default { connectDB, getDB, closeDB };
