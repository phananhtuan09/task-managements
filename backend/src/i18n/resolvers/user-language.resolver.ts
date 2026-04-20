import { Injectable } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { I18nResolver } from 'nestjs-i18n';

@Injectable()
export class UserLanguageResolver implements I18nResolver {
  public resolve(_context: ExecutionContext): string | undefined {
    return undefined;
  }
}
