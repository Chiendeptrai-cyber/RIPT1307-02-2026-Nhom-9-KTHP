import { sign, verify } from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';

export class JwtTokenService {
  sign(payload: Record<string, unknown>): string {
    const secret = process.env.JWT_SECRET ?? 'secret';
    const expiresIn = (process.env.JWT_EXPIRES_IN ?? '8h') as unknown as SignOptions['expiresIn'];
    const options: SignOptions = {
      expiresIn,
    };

    return sign(payload, secret as Secret, options);
  }

  verify<T>(token: string): T {
    const secret = process.env.JWT_SECRET ?? 'secret';
    return verify(token, secret as Secret) as T;
  }
}
