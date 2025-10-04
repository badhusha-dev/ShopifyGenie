// Database connection for Auth Service
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { utils } from '../../../shared';

config();

// Create PostgreSQL connection
const connectionString = utils.Database.getPostgresConnectionString('auth');

const client = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create Drizzle instance
export const db = drizzle(client);

// Test database connection
export async function testConnection() {
  try {
    await client`SELECT 1`;
    utils.Logger.info('Auth Service database connected successfully');
    return true;
  } catch (error) {
    utils.Logger.error('Auth Service database connection failed', error);
    return false;
  }
}

// Close database connection
export async function closeConnection() {
  try {
    await client.end();
    utils.Logger.info('Auth Service database connection closed');
  } catch (error) {
    utils.Logger.error('Error closing Auth Service database connection', error);
  }
}
