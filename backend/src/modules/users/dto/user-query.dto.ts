import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { NormalizedEmail, OptionalTrimmedString } from '../../../common/decorators/request-transform.decorator';
import { i18nMessage } from '../../../i18n/i18n-validation';

enum UserSortField {
  CREATED_AT = 'createdAt',
  EMAIL = 'email',
}

export class UserQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @NormalizedEmail()
  @IsOptional()
  @IsEmail({}, { message: i18nMessage('validation.isEmail') })
  public readonly email?: string;

  @ApiPropertyOptional()
  @OptionalTrimmedString()
  @IsOptional()
  @IsString({ message: i18nMessage('validation.isString') })
  public readonly search?: string;

  @ApiPropertyOptional({ enum: UserSortField, default: UserSortField.CREATED_AT })
  @IsOptional()
  @IsEnum(UserSortField, { message: i18nMessage('validation.isEnum') })
  public readonly orderBy?: UserSortField = UserSortField.CREATED_AT;
}
