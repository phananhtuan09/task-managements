import { ApiProperty } from '@nestjs/swagger';

export class OperationResultDto {
  @ApiProperty({ example: true })
  public readonly success!: boolean;
}
