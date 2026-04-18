import { HttpException, HttpStatus } from '@nestjs/common';

import type { AppErrorCode } from '../constants/error.constants';

export interface AppExceptionResponse {
  readonly code: AppErrorCode;
  readonly message: string | string[];
  readonly details?: unknown;
}

export class BaseAppException extends HttpException {
  public constructor(status: HttpStatus, response: AppExceptionResponse) {
    super(response, status);
  }
}
