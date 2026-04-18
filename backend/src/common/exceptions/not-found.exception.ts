import { HttpStatus } from '@nestjs/common';

import { APP_ERROR_CODE } from '../constants/error.constants';
import { BaseAppException } from './base-app.exception';

export class AppNotFoundException extends BaseAppException {
  public constructor(message: string, details?: unknown) {
    super(HttpStatus.NOT_FOUND, {
      code: APP_ERROR_CODE.NOT_FOUND,
      message,
      details,
    });
  }
}
