export interface PaginateOptions<OrderBy = unknown> {
  readonly page?: number;
  readonly limit?: number;
  readonly orderBy?: OrderBy;
}

export interface PaginateResult<T> {
  readonly data: T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

export interface FindOptions<Select = unknown, Include = unknown, OrderBy = unknown> {
  readonly select?: Select;
  readonly include?: Include;
  readonly orderBy?: OrderBy;
  readonly skip?: number;
  readonly take?: number;
}
