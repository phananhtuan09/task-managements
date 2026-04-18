import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  I18nContext,
  I18nService,
  type PathValue,
  type TranslateOptions,
} from 'nestjs-i18n';

import type { I18nPath, I18nTranslations } from '../generated/i18n.generated';

type AppTranslateOptions = Omit<TranslateOptions, 'lang'>;

@Injectable()
export class AppI18nService {
  public constructor(
    private readonly i18nService: I18nService<I18nTranslations>,
    private readonly configService: ConfigService,
  ) {}

  public t<P extends I18nPath>(
    key: P,
    options?: AppTranslateOptions,
  ): PathValue<I18nTranslations, P> {
    const lang = I18nContext.current()?.lang ?? this.getFallbackLanguage();

    return this.i18nService.t(key, {
      ...options,
      lang,
    }) as PathValue<I18nTranslations, P>;
  }

  public getLanguage(): string {
    return I18nContext.current()?.lang ?? this.getFallbackLanguage();
  }

  private getFallbackLanguage(): string {
    return this.configService.getOrThrow<string>('app.defaultLang');
  }
}
