import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AppConflictException } from '../../common/exceptions/conflict.exception';
import { AppUnauthorizedException } from '../../common/exceptions/unauthorized.exception';
import { AppI18nService } from '../../i18n/app-i18n.service';
import { UserRepository } from '../users/repositories/user.repository';
import { AuthPasswordService } from './auth-password.service';
import {
  AuthTokenResponseDto,
  AuthUserResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly authPasswordService: AuthPasswordService,
    private readonly appI18nService: AppI18nService,
  ) {}

  public async register(payload: RegisterRequestDto): Promise<AuthUserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(payload.email);

    if (existingUser) {
      throw new AppConflictException(this.appI18nService.t('user.errors.emailAlreadyExists'), {
        field: 'email',
      });
    }

    const user = await this.userRepository.create({
      email: payload.email,
      passwordHash: await this.authPasswordService.hashPassword(payload.password),
    });

    return this.toAuthUserResponse(user);
  }

  public async login(payload: LoginRequestDto): Promise<AuthTokenResponseDto> {
    const user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      throw new AppUnauthorizedException(this.appI18nService.t('auth.errors.invalidCredentials'));
    }

    const passwordMatches = await this.authPasswordService.verifyPassword(
      payload.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new AppUnauthorizedException(this.appI18nService.t('auth.errors.invalidCredentials'));
    }

    return this.issueAccessToken({
      sub: user.id,
      email: user.email,
    });
  }

  public async getProfile(userId: string): Promise<AuthUserResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppUnauthorizedException(this.appI18nService.t('auth.errors.invalidCredentials'));
    }

    return this.toAuthUserResponse(user);
  }

  private async issueAccessToken(payload: {
    sub: string;
    email: string;
  }): Promise<AuthTokenResponseDto> {
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
    };
  }

  private toAuthUserResponse(user: {
    id: string;
    email: string;
    createdAt: Date;
  }): AuthUserResponseDto {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
