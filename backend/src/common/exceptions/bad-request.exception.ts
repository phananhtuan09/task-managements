import { HttpStatus } from '@nestjs/common';

import { APP_ERROR_CODE } from '../constants/error.constants';
import { BaseAppException } from './base-app.exception';

export class AppBadRequestException extends BaseAppException {
  public constructor(message: string | string[], details?: unknown) {
    super(HttpStatus.BAD_REQUEST, {
      code: APP_ERROR_CODE.BAD_REQUEST,
      message,
      details,
    });
  }
}
