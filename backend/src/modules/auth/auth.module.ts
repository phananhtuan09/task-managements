import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ShareModule } from '../../shared/share.module';
import { UsersModule } from '../users/users.module';

import { AuthController } from './auth.controller';
import { AuthPasswordService } from './auth-password.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ShareModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('auth.accessSecret'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>('auth.accessExpiresIn') as never,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthPasswordService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, AuthPasswordService, JwtAuthGuard, PassportModule, JwtModule],
})
export class AuthModule {}
