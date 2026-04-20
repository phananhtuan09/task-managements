import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const PASSWORD_SALT_ROUNDS = 10;

@Injectable()
export class AuthPasswordService {
  public hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  }

  public async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, passwordHash);
    } catch {
      return false;
    }
  }
}
