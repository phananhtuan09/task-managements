import { registerAs } from '@nestjs/config';

import { getEnvValue } from '../common/utils';

export default registerAs('auth', () => ({
  accessSecret: getEnvValue('JWT_ACCESS_SECRET', 'string'),
  accessExpiresIn: getEnvValue('JWT_ACCESS_EXPIRES_IN', 'string', '15m'),
}));
