import { INestApplication, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import request from 'supertest';

import { JwtAuthGuard } from '../../../src/common/guards/jwt-auth.guard';
import { AppI18nValidationPipe } from '../../../src/common/pipes/i18n-validation.pipe';
import { AppI18nService } from '../../../src/i18n/app-i18n.service';
import { AuthController } from '../../../src/modules/auth/auth.controller';
import { AuthPasswordService } from '../../../src/modules/auth/auth-password.service';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { JwtStrategy } from '../../../src/modules/auth/jwt.strategy';
import { UserRepository } from '../../../src/modules/users/repositories/user.repository';

interface InMemoryUser {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly createdAt: Date;
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const users = new Map<string, InMemoryUser>();
    let sequence = 1;

    const userRepository = {
      findByEmail: jest.fn(async (email: string) => {
        return Array.from(users.values()).find((user) => user.email === email) ?? null;
      }),
      findById: jest.fn(async (id: string) => {
        return users.get(id) ?? null;
      }),
      create: jest.fn(async (data: {
        email: string;
        passwordHash: string;
      }) => {
        const user: InMemoryUser = {
          id: `user-${sequence++}`,
          email: data.email,
          passwordHash: data.passwordHash,
          createdAt: new Date('2026-04-19T00:00:00.000Z'),
        };

        users.set(user.id, user);

        return user;
      }),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: 'test-access-secret',
          signOptions: {
            expiresIn: '15m',
          },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        AuthPasswordService,
        JwtStrategy,
        JwtAuthGuard,
        {
          provide: UserRepository,
          useValue: userRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => {
              const values: Record<string, string> = {
                'auth.accessSecret': 'test-access-secret',
              };

              return values[key];
            },
          },
        },
        {
          provide: AppI18nService,
          useValue: {
            t: (key: string) => {
              const messages: Record<string, string> = {
                'auth.errors.invalidCredentials': 'Invalid email or password',
                'user.errors.emailAlreadyExists': 'Email already exists',
              };

              return messages[key] ?? key;
            },
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new AppI18nValidationPipe());
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should register, login, and fetch profile when credentials are valid', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'user@example.com',
        password: 'super-secret-password',
      })
      .expect(201);

    expect(registerResponse.body).toEqual({
      id: 'user-1',
      email: 'user@example.com',
      createdAt: '2026-04-19T00:00:00.000Z',
    });
    expect(registerResponse.body).not.toHaveProperty('password');

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'user@example.com',
        password: 'super-secret-password',
      })
      .expect(201);

    expect(loginResponse.body.tokenType).toBe('Bearer');
    expect(loginResponse.body.accessToken).toEqual(expect.any(String));
    expect(loginResponse.body).not.toHaveProperty('refreshToken');

    const profileResponse = await request(app.getHttpServer())
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(200);

    expect(profileResponse.body).toEqual({
      id: 'user-1',
      email: 'user@example.com',
      createdAt: '2026-04-19T00:00:00.000Z',
    });
  });

  it('should reject duplicate registration when the email already exists', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'user@example.com',
        password: 'another-secret-password',
      })
      .expect(409);
  });

  it('should reject invalid payloads and invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'invalid-email',
        password: 'short',
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'user@example.com',
        password: 'wrong-password',
      })
      .expect(401);
  });

  it('should reject profile access when the token is invalid', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/auth/profile')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });
});
