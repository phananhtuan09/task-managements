import { registerAs } from '@nestjs/config';

import { getEnvValue } from '../common/utils';

export default registerAs('redis', () => ({
  host: getEnvValue('REDIS_HOST', 'string', 'localhost'),
  port: getEnvValue('REDIS_PORT', 'number', 6379),
  db: getEnvValue('REDIS_DB', 'number', 0),
  username: getEnvValue('REDIS_USERNAME', 'string', ''),
  password: getEnvValue('REDIS_PASSWORD', 'string', ''),
}));
