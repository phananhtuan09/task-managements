import { HttpStatus } from '@nestjs/common';

import { APP_ERROR_CODE } from '../constants/error.constants';
import { BaseAppException } from './base-app.exception';

export class AppUnprocessableException extends BaseAppException {
  public constructor(message: string | string[], details?: unknown) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, {
      code: APP_ERROR_CODE.UNPROCESSABLE_ENTITY,
      message,
      details,
    });
  }
}
