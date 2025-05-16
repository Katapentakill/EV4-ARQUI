import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateStaticToken(): Promise<string> {
    const payload = {
      sub: 'usuario-123',
      email: 'admin@ucn.cl',
      role: 'admin',
    };

    return this.jwtService.sign(payload);
  }
  async verifyToken(token: string) {
    return this.jwtService.verify(token);
  }
}