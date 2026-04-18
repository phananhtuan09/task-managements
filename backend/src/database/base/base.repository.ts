import { Injectable } from '@nestjs/common';

import type { FindOptions, PaginateOptions, PaginateResult } from './base.repository.types';

interface BaseModelDelegate<
  Entity,
  WhereUnique,
  Where,
  CreateInput,
  UpdateInput,
  Select = unknown,
  Include = unknown,
  OrderBy = unknown,
> {
  findUnique(args: { where: WhereUnique; select?: Select; include?: Include }): Promise<Entity | null>;
  findFirst(args: {
    where?: Where;
    select?: Select;
    include?: Include;
    orderBy?: OrderBy;
    skip?: number;
    take?: number;
  }): Promise<Entity | null>;
  findMany(args: {
    where?: Where;
    select?: Select;
    include?: Include;
    orderBy?: OrderBy;
    skip?: number;
    take?: number;
  }): Promise<Entity[]>;
  create(args: { data: CreateInput; select?: Select; include?: Include }): Promise<Entity>;
  createMany(args: { data: CreateInput[] }): Promise<{ count: number }>;
  update(args: { where: WhereUnique; data: UpdateInput; select?: Select; include?: Include }): Promise<Entity>;
  updateMany(args: { where?: Where; data: UpdateInput }): Promise<{ count: number }>;
  delete(args: { where: WhereUnique }): Promise<Entity>;
  count(args?: { where?: Where }): Promise<number>;
}

@Injectable()
export abstract class BaseRepository<
  Entity,
  WhereUnique extends Record<string, unknown>,
  Where extends Record<string, unknown>,
  CreateInput,
  UpdateInput extends Record<string, unknown>,
  Select = unknown,
  Include = unknown,
  OrderBy = unknown,
> {
  protected constructor(
    protected readonly model: BaseModelDelegate<
      Entity,
      WhereUnique,
      Where,
      CreateInput,
      UpdateInput,
      Select,
      Include,
      OrderBy
    >,
  ) {}

  public findById(
    id: string,
    options?: Omit<FindOptions<Select, Include, OrderBy>, 'skip' | 'take'>,
  ): Promise<Entity | null> {
    return this.model.findUnique({
      where: { id } as unknown as WhereUnique,
      select: options?.select,
      include: options?.include,
    });
  }

  public findOne(where: Where, options?: FindOptions<Select, Include, OrderBy>): Promise<Entity | null> {
    return this.model.findFirst({
      where,
      select: options?.select,
      include: options?.include,
      orderBy: options?.orderBy,
      skip: options?.skip,
      take: options?.take,
    });
  }

  public findMany(where?: Where, options?: FindOptions<Select, Include, OrderBy>): Promise<Entity[]> {
    return this.model.findMany({
      where,
      select: options?.select,
      include: options?.include,
      orderBy: options?.orderBy,
      skip: options?.skip,
      take: options?.take,
    });
  }

  public create(
    data: CreateInput,
    options?: Omit<FindOptions<Select, Include, OrderBy>, 'orderBy' | 'skip' | 'take'>,
  ): Promise<Entity> {
    return this.model.create({
      data,
      select: options?.select,
      include: options?.include,
    });
  }

  public createMany(data: CreateInput[]): Promise<{ count: number }> {
    return this.model.createMany({ data });
  }

  public update(
    where: WhereUnique,
    data: UpdateInput,
    options?: Omit<FindOptions<Select, Include, OrderBy>, 'orderBy' | 'skip' | 'take'>,
  ): Promise<Entity> {
    return this.model.update({
      where,
      data,
      select: options?.select,
      include: options?.include,
    });
  }

  public updateMany(where: Where, data: UpdateInput): Promise<{ count: number }> {
    return this.model.updateMany({
      where,
      data,
    });
  }

  public delete(where: WhereUnique): Promise<Entity> {
    return this.model.delete({ where });
  }

  public softDelete(where: WhereUnique): Promise<Entity> {
    return this.model.update({
      where,
      data: { deletedAt: new Date() } as unknown as UpdateInput,
    });
  }

  public async paginate(
    where: Where | undefined,
    options: PaginateOptions<OrderBy> = {},
  ): Promise<PaginateResult<Entity>> {
    const page = Math.max(options.page ?? 1, 1);
    const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        orderBy: options.orderBy,
        skip,
        take: limit,
      }),
      this.model.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  public async exists(where: Where): Promise<boolean> {
    return (await this.model.count({ where })) > 0;
  }

  public count(where?: Where): Promise<number> {
    return this.model.count({ where });
  }
}
