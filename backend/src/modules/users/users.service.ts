import { Injectable } from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';

import { AppConflictException } from '../../common/exceptions/conflict.exception';
import { AppNotFoundException } from '../../common/exceptions/not-found.exception';
import type { PaginateResult } from '../../database/base/base.repository.types';
import { AppI18nService } from '../../i18n/app-i18n.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly appI18nService: AppI18nService,
  ) {}

  public async findAll(query: UserQueryDto): Promise<PaginateResult<UserResponseDto>> {
    const where = this.buildWhere(query);

    const result = await this.userRepository.paginate(where, {
      page: query.page,
      limit: query.limit,
      orderBy: { [query.orderBy ?? 'createdAt']: 'desc' } as Prisma.UserOrderByWithRelationInput,
    });

    return {
      ...result,
      data: result.data.map((user) => this.toResponseDto(user)),
    };
  }

  public async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppNotFoundException(this.appI18nService.t('user.errors.notFound'));
    }

    return this.toResponseDto(user);
  }

  public async create(payload: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(payload.email);

    if (existingUser) {
      throw new AppConflictException(this.appI18nService.t('user.errors.emailAlreadyExists'), {
        field: 'email',
      });
    }

    const user = await this.userRepository.create({
      email: payload.email,
      fullName: payload.fullName,
      passwordHash: this.hashPassword(payload.password),
    });

    return this.toResponseDto(user);
  }

  public async update(id: string, payload: UpdateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new AppNotFoundException(this.appI18nService.t('user.errors.notFound'));
    }

    if (payload.email && payload.email !== existingUser.email) {
      const duplicatedUser = await this.userRepository.findByEmail(payload.email);

      if (duplicatedUser) {
        throw new AppConflictException(this.appI18nService.t('user.errors.emailAlreadyExists'), {
          field: 'email',
        });
      }
    }

    const user = await this.userRepository.update(
      { id },
      {
        email: payload.email,
        fullName: payload.fullName,
        passwordHash: payload.password ? this.hashPassword(payload.password) : undefined,
      },
    );

    return this.toResponseDto(user);
  }

  public async remove(id: string): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new AppNotFoundException(this.appI18nService.t('user.errors.notFound'));
    }

    const user = await this.userRepository.delete({ id });

    return this.toResponseDto(user);
  }

  private buildWhere(query: UserQueryDto): Prisma.UserWhereInput | undefined {
    const conditions: Prisma.UserWhereInput[] = [];

    if (query.email) {
      conditions.push({ email: query.email });
    }

    if (query.search) {
      conditions.push({
        OR: [
          { email: { contains: query.search, mode: 'insensitive' } },
          { fullName: { contains: query.search, mode: 'insensitive' } },
        ],
      });
    }

    if (conditions.length === 0) {
      return undefined;
    }

    if (conditions.length === 1) {
      return conditions[0];
    }

    return { AND: conditions };
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const digest = createHash('sha256')
      .update(`${salt}:${password}`)
      .digest('hex');

    return `${salt}:${digest}`;
  }
}
