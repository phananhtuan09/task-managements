export class ApiResponse<T> {
  public readonly success = true;

  public constructor(
    public readonly data: T,
    public readonly message: string | undefined,
    public readonly requestId: string | undefined,
    public readonly timestamp = new Date().toISOString(),
  ) {}
}
