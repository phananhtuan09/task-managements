type EnvRecord = Record<string, string | undefined>;

function requireString(env: EnvRecord, key: string): string {
  const value = env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function validateEnv(env: EnvRecord): EnvRecord {
  requireString(env, 'NODE_ENV');
  requireString(env, 'DATABASE_URL');
  requireString(env, 'JWT_ACCESS_SECRET');
  requireString(env, 'JWT_REFRESH_SECRET');

  return env;
}
