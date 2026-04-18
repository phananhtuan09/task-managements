import { HttpStatus } from '@nestjs/common';

import { APP_ERROR_CODE } from '../constants/error.constants';
import { BaseAppException } from './base-app.exception';

export class AppForbiddenException extends BaseAppException {
  public constructor(message: string, details?: unknown) {
    super(HttpStatus.FORBIDDEN, {
      code: APP_ERROR_CODE.FORBIDDEN,
      message,
      details,
    });
  }
}
