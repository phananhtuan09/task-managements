import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

import { i18nMessage } from '../../i18n/i18n-validation';

export class IdParamDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID(undefined, { message: i18nMessage('validation.isUUID') })
  public readonly id!: string;
}
