import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Observable } from 'rxjs';

interface RequestContextStore {
  readonly requestId: string;
  readonly userId?: string;
}

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContextStore>();

  public run<T>(store: RequestContextStore, callback: () => T): T {
    return this.storage.run(store, callback);
  }

  public getRequestId(): string | undefined {
    return this.storage.getStore()?.requestId;
  }

  public getUserId(): string | undefined {
    return this.storage.getStore()?.userId;
  }

  public bindObservable<T>(store: RequestContextStore, observable: Observable<T>): Observable<T> {
    return new Observable<T>((subscriber) =>
      this.run(store, () =>
        observable.subscribe({
          next: (value) => subscriber.next(value),
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        }),
      ),
    );
  }
}
