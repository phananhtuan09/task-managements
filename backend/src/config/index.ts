import appConfig from './app.config';
import authConfig from './auth.config';
import dbConfig from './db.config';
import redisConfig from './redis.config';

export const appConfigurations = [appConfig, authConfig, dbConfig, redisConfig];

export { appConfig, authConfig, dbConfig, redisConfig };
