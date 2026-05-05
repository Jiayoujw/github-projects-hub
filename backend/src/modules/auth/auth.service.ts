import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (existing) {
      throw new ConflictException('用户名或邮箱已存在');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        passwordHash,
      },
      include: { role: true },
    });

    const tokens = this.generateTokens(user);
    return { ...tokens, user: this.sanitizeUser(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = this.generateTokens(user);
    return { ...tokens, user: this.sanitizeUser(user) };
  }

  async createOrUpdateGithubUser(githubUser: {
    id: number;
    login: string;
    avatar_url: string;
    email: string | null;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { githubId: BigInt(githubUser.id) },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          githubId: BigInt(githubUser.id),
          username: githubUser.login,
          email: githubUser.email,
          avatarUrl: githubUser.avatar_url,
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          avatarUrl: githubUser.avatar_url,
          lastLoginAt: new Date(),
        },
      });
    }

    return user;
  }

  generateTokens(user: { id: string; username: string; role?: any }) {
    const roleName = typeof user.role === 'object' && user.role?.name ? user.role.name : 'user';
    const payload = { sub: user.id, username: user.username, role: roleName };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
