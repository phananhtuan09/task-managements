import { Module } from '@nestjs/common';

import { ShareModule } from '../../shared/share.module';
import { AuthPasswordService } from '../auth/auth-password.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [ShareModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, AuthPasswordService],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
