import { Injectable } from '@nestjs/common';
import {
  Prisma,
  type User,
} from '@prisma/client';

import { BaseRepository } from '../../../database/base/base.repository';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class UserRepository extends BaseRepository<
  User,
  Prisma.UserWhereUniqueInput,
  Prisma.UserWhereInput,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserSelect,
  Prisma.UserInclude,
  Prisma.UserOrderByWithRelationInput
> {
  public constructor(prismaService: PrismaService) {
    super(prismaService.user);
  }

  public findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }
}
