import { i18nValidationMessage } from 'nestjs-i18n';
import type { ValidationArguments } from 'class-validator';

import type { I18nPath, I18nTranslations } from '../generated/i18n.generated';

export function i18nMessage(key: I18nPath): (args: ValidationArguments) => string {
  return i18nValidationMessage<I18nTranslations>(key);
}
