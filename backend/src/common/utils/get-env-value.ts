type EnvValueType = 'string' | 'number' | 'boolean';

type EnvValueMap = {
  string: string;
  number: number;
  boolean: boolean;
};

function parseBooleanValue(rawValue: string, key: string): boolean {
  const normalizedValue = rawValue.trim().toLowerCase();

  if (normalizedValue === 'true') {
    return true;
  }

  if (normalizedValue === 'false') {
    return false;
  }

  throw new Error(`Environment variable ${key} must be a valid boolean`);
}

export function getEnvValue<TType extends EnvValueType>(
  key: string,
  type: TType,
  defaultValue?: EnvValueMap[TType],
): EnvValueMap[TType] {
  const rawValue = process.env[key];

  if (rawValue === undefined || rawValue === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(`Missing required environment variable: ${key}`);
  }

  if (type === 'number') {
    const numericValue = Number(rawValue);

    if (Number.isNaN(numericValue)) {
      throw new Error(`Environment variable ${key} must be a valid number`);
    }

    return numericValue as EnvValueMap[TType];
  }

  if (type === 'boolean') {
    return parseBooleanValue(rawValue, key) as EnvValueMap[TType];
  }

  return rawValue as EnvValueMap[TType];
}
