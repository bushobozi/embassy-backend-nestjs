import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Update refresh token in database
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: tokens.refresh_token },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshTokens(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: tokens.refresh_token },
    });

    return tokens;
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refresh_token: null },
    });

    return { message: 'Logged out successfully' };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  private async generateTokens(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    const accessExpiration = process.env.JWT_ACCESS_EXPIRATION || '24h';
    const refreshExpiration = process.env.JWT_REFRESH_EXPIRATION || '7d';

    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets are not configured');
    }

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiration,
      } as any),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiration,
      } as any),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }
}
