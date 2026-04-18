import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import {
  AuthTokenResponseDto,
  AuthUserResponseDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async register(payload: RegisterRequestDto): Promise<AuthUserResponseDto> {
    return {
      id: 'bootstrap-user-id',
      email: payload.email,
      fullName: payload.fullName,
    };
  }

  public async login(payload: LoginRequestDto): Promise<AuthTokenResponseDto> {
    return this.issueTokens({
      sub: 'bootstrap-user-id',
      email: payload.email,
      roles: ['member'],
      lang: 'en',
    });
  }

  public async refresh(payload: RefreshTokenRequestDto): Promise<AuthTokenResponseDto> {
    const decoded = await this.jwtService.verifyAsync<{
      sub: string;
      email: string;
      roles: string[];
      lang?: string;
    }>(payload.refreshToken, {
      secret: this.configService.getOrThrow<string>('auth.refreshSecret'),
    });

    return this.issueTokens(decoded);
  }

  public async logout(): Promise<{ success: boolean }> {
    return { success: true };
  }

  public async me(): Promise<AuthUserResponseDto> {
    return {
      id: 'bootstrap-user-id',
      email: 'demo@example.com',
      fullName: 'Bootstrap User',
    };
  }

  private async issueTokens(payload: {
    sub: string;
    email: string;
    roles: string[];
    lang?: string;
  }): Promise<AuthTokenResponseDto> {
    const accessExpiresIn = this.configService.getOrThrow<string>(
      'auth.accessExpiresIn',
    ) as never;
    const refreshExpiresIn = this.configService.getOrThrow<string>(
      'auth.refreshExpiresIn',
    ) as never;
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('auth.accessSecret'),
      expiresIn: accessExpiresIn,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('auth.refreshSecret'),
      expiresIn: refreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }
}
