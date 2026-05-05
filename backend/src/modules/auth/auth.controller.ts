import { Controller, Post, Body, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @ApiOperation({ summary: '邮箱注册' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: '邮箱登录' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Get('github')
  @ApiOperation({ summary: 'GitHub OAuth 跳转' })
  @UseGuards(AuthGuard('github'))
  githubLogin() {}

  @Public()
  @Get('github/callback')
  @ApiOperation({ summary: 'GitHub OAuth 回调' })
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: any, @Res() res: any) {
    const { accessToken, refreshToken } = this.authService.generateTokens(req.user);
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`,
    );
  }
}
