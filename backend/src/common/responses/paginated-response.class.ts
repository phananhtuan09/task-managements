import { ApiResponse } from './api-response.class';

export class PaginatedResponse<T> extends ApiResponse<T[]> {
  public readonly meta: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };

  public constructor(
    data: T[],
    total: number,
    page: number,
    limit: number,
    requestId: string | undefined,
    message?: string,
  ) {
    super(data, message, requestId);
    this.meta = {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }
}
