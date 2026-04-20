import { JwtService } from '@nestjs/jwt';

import { AppConflictException } from '../../../src/common/exceptions/conflict.exception';
import { AppUnauthorizedException } from '../../../src/common/exceptions/unauthorized.exception';
import { AppI18nService } from '../../../src/i18n/app-i18n.service';
import { AuthPasswordService } from '../../../src/modules/auth/auth-password.service';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { UserRepository } from '../../../src/modules/users/repositories/user.repository';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Pick<UserRepository, 'findByEmail' | 'findById' | 'create'>>;
  let authPasswordService: jest.Mocked<Pick<AuthPasswordService, 'hashPassword' | 'verifyPassword'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    authPasswordService = {
      hashPassword: jest.fn(),
      verifyPassword: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
    };

    const appI18nService = {
      t: jest.fn((key: string) => {
        const messages: Record<string, string> = {
          'user.errors.emailAlreadyExists': 'Email already exists',
          'auth.errors.invalidCredentials': 'Invalid email or password',
        };

        return messages[key] ?? key;
      }),
    } as unknown as AppI18nService;

    service = new AuthService(
      jwtService as unknown as JwtService,
      userRepository as unknown as UserRepository,
      authPasswordService as unknown as AuthPasswordService,
      appI18nService,
    );
  });

  it('should register a user when the email is available', async () => {
    const createdAt = new Date('2026-04-19T00:00:00.000Z');
    userRepository.findByEmail.mockResolvedValue(null);
    authPasswordService.hashPassword.mockResolvedValue('hashed-password');
    userRepository.create.mockResolvedValue({
      id: 'user-1',
      email: 'new@example.com',
      createdAt,
    } as never);

    const result = await service.register({
      email: 'new@example.com',
      password: 'super-secret-password',
    });

    expect(authPasswordService.hashPassword).toHaveBeenCalledWith('super-secret-password');
    expect(userRepository.create).toHaveBeenCalledWith({
      email: 'new@example.com',
      passwordHash: 'hashed-password',
    });
    expect(result).toEqual({
      id: 'user-1',
      email: 'new@example.com',
      createdAt,
    });
  });

  it('should reject duplicate email registration', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'user-1' } as never);

    await expect(
      service.register({
        email: 'existing@example.com',
        password: 'super-secret-password',
      }),
    ).rejects.toBeInstanceOf(AppConflictException);
  });

  it('should return an access token when credentials are valid', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hashed-password',
    } as never);
    authPasswordService.verifyPassword.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('signed-jwt');

    const result = await service.login({
      email: 'user@example.com',
      password: 'super-secret-password',
    });

    expect(authPasswordService.verifyPassword).toHaveBeenCalledWith(
      'super-secret-password',
      'hashed-password',
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'user@example.com',
    });
    expect(result).toEqual({
      accessToken: 'signed-jwt',
      tokenType: 'Bearer',
    });
  });

  it('should reject login when credentials are invalid', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hashed-password',
    } as never);
    authPasswordService.verifyPassword.mockResolvedValue(false);

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(AppUnauthorizedException);
  });

  it('should return the authenticated profile when the user exists', async () => {
    const createdAt = new Date('2026-04-19T00:00:00.000Z');
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      createdAt,
    } as never);

    await expect(service.getProfile('user-1')).resolves.toEqual({
      id: 'user-1',
      email: 'user@example.com',
      createdAt,
    });
  });
});
