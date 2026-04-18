import { registerAs } from '@nestjs/config';

import { getEnvValue } from '../common/utils';

export default registerAs('database', () => ({
  url: getEnvValue('DATABASE_URL', 'string'),
  directUrl: getEnvValue(
    'DIRECT_DATABASE_URL',
    'string',
    getEnvValue('DATABASE_URL', 'string'),
  ),
}));
