import { Injectable } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { I18nResolver } from 'nestjs-i18n';

import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class UserLanguageResolver implements I18nResolver {
  public resolve(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();

    return request.user?.lang;
  }
}
