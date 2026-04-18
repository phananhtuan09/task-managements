import type { INestApplication } from '@nestjs/common';

import { AppI18nValidationPipe } from '../common/pipes/i18n-validation.pipe';

export function setupValidation(app: INestApplication): void {
  app.useGlobalPipes(new AppI18nValidationPipe());
}
