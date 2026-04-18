import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import { i18nMessage } from '../../i18n/i18n-validation';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: i18nMessage('validation.isInt') })
  @Min(1, { message: i18nMessage('validation.min') })
  public readonly page?: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: i18nMessage('validation.isInt') })
  @Min(1, { message: i18nMessage('validation.min') })
  @Max(100, { message: i18nMessage('validation.max') })
  public readonly limit?: number = 20;
}
