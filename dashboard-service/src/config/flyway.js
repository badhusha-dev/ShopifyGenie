const { Flyway } = require('node-flyway');
const logger = require('./logger');
require('dotenv').config();

const createFlywayConfig = () => {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/dashboarddb';
  
  const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  
  if (!urlParts) {
    throw new Error('Invalid DATABASE_URL format. Expected: postgresql://user:pass@host:port/database');
  }

  const [, user, password, host, port, database] = urlParts;

  const config = {
    url: `jdbc:postgresql://${host}:${port}/${database}`,
    user,
    password,
    defaultSchema: 'public',
    locations: ['filesystem:./migrations'],
    table: 'flyway_schema_history',
    validateOnMigrate: true,
    outOfOrder: false
  };

  return new Flyway(config);
};

const runMigrations = async () => {
  try {
    logger.info('🔄 Starting database migrations...');
    
    const flyway = createFlywayConfig();
    
    const infoResult = await flyway.info();
    logger.info(`📊 Migration status: ${infoResult.migrationsExecuted} executed, ${infoResult.migrationsPending} pending`);
    
    const result = await flyway.migrate();
    
    if (result.success) {
      logger.info(`✅ Migrations completed successfully!`);
      logger.info(`📈 Migrations executed: ${result.migrationsExecuted}`);
      if (result.migrations && result.migrations.length > 0) {
        result.migrations.forEach(m => {
          logger.info(`  ✓ ${m.version} - ${m.description}`);
        });
      }
    } else {
      logger.error(`❌ Migration failed: ${result.error}`);
      throw new Error(result.error);
    }
    
    return result;
  } catch (error) {
    logger.error('❌ Migration error:', error);
    throw error;
  }
};

const getMigrationInfo = async () => {
  try {
    const flyway = createFlywayConfig();
    return await flyway.info();
  } catch (error) {
    logger.error('Error getting migration info:', error);
    throw error;
  }
};

const validateMigrations = async () => {
  try {
    const flyway = createFlywayConfig();
    return await flyway.validate();
  } catch (error) {
    logger.error('Error validating migrations:', error);
    throw error;
  }
};

module.exports = {
  runMigrations,
  getMigrationInfo,
  validateMigrations,
  createFlywayConfig
};
