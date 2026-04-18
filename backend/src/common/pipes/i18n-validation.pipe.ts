import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { I18nValidationPipe } from 'nestjs-i18n';

import { APP_ERROR_CODE } from '../constants/error.constants';

function flattenValidationMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => {
    const currentMessages = Object.values(error.constraints ?? {});
    const nestedMessages = flattenValidationMessages(error.children ?? []);

    return [...currentMessages, ...nestedMessages];
  });
}

export class AppI18nValidationPipe extends I18nValidationPipe {
  public constructor() {
    super({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
      validationError: {
        target: false,
        value: false,
      },
      transformOptions: {
        enableImplicitConversion: true,
      },
    });

    this.exceptionFactory = (errors: ValidationError[]) =>
      new BadRequestException({
        code: APP_ERROR_CODE.VALIDATION_ERROR,
        message: flattenValidationMessages(errors),
        details: errors,
      });
  }
}
