import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface LinkedInProfile {
  provider: 'linkedin';
  providerUserId: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
}

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('LINKEDIN_CLIENT_ID') || 'dummy';
    const clientSecret = configService.get<string>('LINKEDIN_CLIENT_SECRET') || 'dummy';
    const callbackURL = configService.get<string>('LINKEDIN_CALLBACK_URL') || 'http://localhost:3000/auth/linkedin/callback';

    if (clientID === 'dummy' || clientSecret === 'dummy') {
      console.warn('[LinkedInStrategy] OAuth credentials not configured. LinkedIn login will not work.');
    }

    super({
      authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
      clientID,
      clientSecret,
      callbackURL,
      scope: ['openid', 'profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: LinkedInProfile) => void,
  ): Promise<void> {
    try {
      // Fetch user info from LinkedIn OIDC userinfo endpoint
      const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const userInfo = response.data;

      const payload: LinkedInProfile = {
        provider: 'linkedin',
        providerUserId: userInfo.sub,
        email: userInfo.email || null,
        name:
          userInfo.name ||
          (userInfo.given_name && userInfo.family_name
            ? `${userInfo.given_name} ${userInfo.family_name}`
            : userInfo.given_name || userInfo.family_name || null),
        avatarUrl: userInfo.picture || null,
      };

      done(null, payload);
    } catch (error) {
      done(error, undefined);
    }
  }
}

