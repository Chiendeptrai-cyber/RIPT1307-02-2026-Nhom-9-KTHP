import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { JwtTokenService } from '../../../infrastructure/services/jwt-token.service';
import bcrypt from 'bcryptjs';

export class LoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenService: JwtTokenService,
  ) {}

  async execute(data: { email: string; password: string }): Promise<{ accessToken: string }> {
    const user = await this.userRepo.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.tokenService.sign({ userId: user.id, role: user.role });
    return { accessToken: token };
  }
}
