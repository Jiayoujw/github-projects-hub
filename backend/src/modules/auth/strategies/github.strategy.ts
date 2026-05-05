import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID')!,
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL')!,
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: (err: any, user: any) => void,
  ) {
    try {
      const { id, username, emails, photos } = profile;
      const user = await this.authService.createOrUpdateGithubUser({
        id: parseInt(id),
        login: username || '',
        avatar_url: photos?.[0]?.value || '',
        email: emails?.[0]?.value || null,
      });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
}
