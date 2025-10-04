import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { DatabaseUtils } from '../../shared/utils';

dotenv.config();

// Get PostgreSQL connection string
const connectionString = DatabaseUtils.getPostgresConnectionString('order');

// Create postgres client
const client = postgres(connectionString);

// Create drizzle instance
export const db = drizzle(client);

// Test database connection
export async function testConnection(): Promise<void> {
  try {
    await client`SELECT 1`;
    console.log('✅ Order Service PostgreSQL connection successful');
  } catch (error) {
    console.error('❌ Order Service PostgreSQL connection failed:', error);
    throw error;
  }
}

// Close database connection
export async function closeConnection(): Promise<void> {
  await client.end();
}
