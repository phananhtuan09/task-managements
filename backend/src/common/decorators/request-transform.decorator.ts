import { Transform } from 'class-transformer';

function normalizeStringValue(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  return value.trim();
}

export function TrimmedString(): PropertyDecorator {
  return Transform(({ value }) => normalizeStringValue(value));
}

export function OptionalTrimmedString(): PropertyDecorator {
  return Transform(({ value }) => {
    const normalizedValue = normalizeStringValue(value);

    if (normalizedValue === '') {
      return undefined;
    }

    return normalizedValue;
  });
}

export function NormalizedEmail(): PropertyDecorator {
  return Transform(({ value }) => {
    const normalizedValue = normalizeStringValue(value);

    if (typeof normalizedValue !== 'string') {
      return normalizedValue;
    }

    return normalizedValue.toLowerCase();
  });
}
