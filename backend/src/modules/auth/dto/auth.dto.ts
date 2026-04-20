import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { NormalizedEmail, TrimmedString } from '../../../common/decorators/request-transform.decorator';
import { i18nMessage } from '../../../i18n/i18n-validation';

export class RegisterRequestDto {
  @ApiProperty()
  @NormalizedEmail()
  @IsEmail({}, { message: i18nMessage('validation.isEmail') })
  public readonly email!: string;

  @ApiProperty()
  @TrimmedString()
  @IsString({ message: i18nMessage('validation.isString') })
  @MinLength(8, { message: i18nMessage('validation.minLength') })
  public readonly password!: string;
}

export class LoginRequestDto {
  @ApiProperty()
  @NormalizedEmail()
  @IsEmail({}, { message: i18nMessage('validation.isEmail') })
  public readonly email!: string;

  @ApiProperty()
  @TrimmedString()
  @IsString({ message: i18nMessage('validation.isString') })
  @MinLength(8, { message: i18nMessage('validation.minLength') })
  public readonly password!: string;
}

export class AuthTokenResponseDto {
  @ApiProperty()
  public readonly accessToken!: string;

  @ApiProperty()
  public readonly tokenType!: string;
}

export class AuthUserResponseDto {
  @ApiProperty()
  public readonly id!: string;

  @ApiProperty()
  public readonly email!: string;

  @ApiProperty()
  public readonly createdAt!: Date;
}
