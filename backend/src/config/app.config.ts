import { registerAs } from '@nestjs/config';

import {
  THROTTLE_MAX_REQUESTS,
  THROTTLE_WINDOW_SECONDS,
} from '../common/constants/request.constants';
import { getEnvValue } from '../common/utils';

export default registerAs('app', () => ({
  name: getEnvValue('APP_NAME', 'string', 'task-management-api'),
  port: getEnvValue('PORT', 'number', 3000),
  globalPrefix: getEnvValue('APP_GLOBAL_PREFIX', 'string', 'api'),
  swaggerPath: getEnvValue('APP_SWAGGER_PATH', 'string', 'docs'),
  corsOrigin: getEnvValue('APP_CORS_ORIGIN', 'string', '*'),
  defaultLang: getEnvValue('APP_DEFAULT_LANG', 'string', 'en'),
  error: {
    debugKey: process.env.APP_ERROR_DEBUG_KEY?.trim() || undefined,
    debugHeader: getEnvValue('APP_ERROR_DEBUG_HEADER', 'string', 'x-error-debug-key'),
  },
  throttle: {
    ttlSeconds: THROTTLE_WINDOW_SECONDS,
    limit: THROTTLE_MAX_REQUESTS,
  },
}));
