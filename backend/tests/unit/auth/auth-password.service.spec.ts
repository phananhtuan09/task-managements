import { AuthPasswordService } from '../../../src/modules/auth/auth-password.service';

describe('AuthPasswordService', () => {
  let service: AuthPasswordService;

  beforeEach(() => {
    service = new AuthPasswordService();
  });

  it('should hash passwords when given a plain-text password', async () => {
    const password = 'super-secret-password';

    const passwordHash = await service.hashPassword(password);

    expect(passwordHash).toBeTruthy();
    expect(passwordHash).not.toBe(password);
  });

  it('should verify passwords when the password matches the stored hash', async () => {
    const password = 'super-secret-password';
    const passwordHash = await service.hashPassword(password);

    await expect(service.verifyPassword(password, passwordHash)).resolves.toBe(true);
    await expect(service.verifyPassword('wrong-password', passwordHash)).resolves.toBe(false);
  });

  it('should fail safely when the stored hash is invalid', async () => {
    await expect(service.verifyPassword('super-secret-password', 'not-a-bcrypt-hash')).resolves.toBe(
      false,
    );
  });
});
