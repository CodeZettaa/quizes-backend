import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface GoogleProfile {
  provider: 'google';
  providerUserId: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID') || 'dummy';
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET') || 'dummy';
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/auth/google/callback';

    if (clientID === 'dummy' || clientSecret === 'dummy') {
      console.warn('[GoogleStrategy] OAuth credentials not configured. Google login will not work.');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['openid', 'profile', 'email'],
      prompt: 'select_account',
      accessType: 'offline',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<GoogleProfile> {
    const { id, emails, name, photos } = profile;

    // Better name extraction: prefer displayName, then construct from givenName + familyName
    let fullName = name?.displayName || null;
    if (!fullName && (name?.givenName || name?.familyName)) {
      const parts = [name?.givenName, name?.familyName].filter(Boolean);
      fullName = parts.length > 0 ? parts.join(' ') : null;
    }

    const payload: GoogleProfile = {
      provider: 'google',
      providerUserId: id,
      email: emails?.[0]?.value || null,
      name: fullName,
      avatarUrl: photos?.[0]?.value || null,
    };

    return payload;
  }
}

