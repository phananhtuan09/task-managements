import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  public readonly id!: string;

  @ApiProperty()
  public readonly email!: string;

  @ApiProperty()
  public readonly fullName!: string;

  @ApiProperty()
  public readonly createdAt!: Date;

  @ApiProperty()
  public readonly updatedAt!: Date;
}
