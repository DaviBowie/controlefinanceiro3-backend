import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import type { User } from '../users/user.entity';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

export interface UserResponse {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const exists = await this.users.findByEmail(dto.email);
    if (exists) {
      throw new ConflictException('Este email já está registado.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.users.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

    return { token: this.sign(user), user: this.sanitize(user) };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.users.findByEmailWithPassword(dto.email);
    if (!user) {
      // Usa a mesma mensagem para não revelar se o email existe
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return { token: this.sign(user), user: this.sanitize(user) };
  }

  private sign(user: User): string {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return this.jwt.sign(payload);
  }

  private sanitize(user: User): UserResponse {
    return { id: user.id, email: user.email, name: user.name };
  }
}
