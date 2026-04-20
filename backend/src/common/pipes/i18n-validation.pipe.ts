import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import {
  I18nContext,
  I18nService,
  I18nValidationPipe,
} from 'nestjs-i18n';
import { formatI18nErrors } from 'nestjs-i18n/dist/utils';

import { APP_ERROR_CODE } from '../constants/error.constants';
import type { I18nTranslations } from '../../generated/i18n.generated';

function flattenValidationMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => {
    const currentMessages = Object.values(error.constraints ?? {});
    const nestedMessages = flattenValidationMessages(error.children ?? []);

    return [...currentMessages, ...nestedMessages];
  });
}

@Injectable()
export class AppI18nValidationPipe extends I18nValidationPipe {
  public constructor(
    private readonly i18nService: I18nService<I18nTranslations>,
  ) {
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

    this.exceptionFactory = (errors: ValidationError[]) => {
      const lang = I18nContext.current()?.lang;
      const translatedErrors = formatI18nErrors(errors, this.i18nService, { lang });

      return new BadRequestException({
        code: APP_ERROR_CODE.VALIDATION_ERROR,
        message: flattenValidationMessages(translatedErrors),
        details: translatedErrors,
      });
    };
  }
}
