import { HttpStatus } from '@nestjs/common';

import { APP_ERROR_CODE } from '../constants/error.constants';
import { BaseAppException } from './base-app.exception';

export class AppConflictException extends BaseAppException {
  public constructor(message: string, details?: unknown) {
    super(HttpStatus.CONFLICT, {
      code: APP_ERROR_CODE.CONFLICT,
      message,
      details,
    });
  }
}
