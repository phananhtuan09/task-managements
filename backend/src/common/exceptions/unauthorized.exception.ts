import { HttpStatus } from '@nestjs/common';

import { APP_ERROR_CODE } from '../constants/error.constants';
import { BaseAppException } from './base-app.exception';

export class AppUnauthorizedException extends BaseAppException {
  public constructor(message: string, details?: unknown) {
    super(HttpStatus.UNAUTHORIZED, {
      code: APP_ERROR_CODE.UNAUTHORIZED,
      message,
      details,
    });
  }
}
