const { runMigrations } = require('../config/flyway');
const logger = require('../config/logger');

const runMigrationsScript = async () => {
  try {
    logger.info('🚀 Database Migration Script');
    logger.info('============================');
    
    await runMigrations();
    
    logger.info('============================');
    logger.info('✅ Migration script completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration script failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  runMigrationsScript();
}

module.exports = { runMigrationsScript };
