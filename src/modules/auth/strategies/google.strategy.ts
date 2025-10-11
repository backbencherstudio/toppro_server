import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import appConfig from '../../../config/app.config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    const config = appConfig();

    // Check if Google OAuth is properly configured
    if (!config.auth.google.app_id || !config.auth.google.app_secret) {
      console.warn('⚠️  Google OAuth not configured. Please set GOOGLE_APP_ID and GOOGLE_APP_SECRET environment variables.');
      // Use dummy values to prevent the error, but the strategy won't work
      super({
        clientID: 'dummy-client-id',
        clientSecret: 'dummy-client-secret',
        callbackURL: config.auth.google.callback || 'http://localhost:3000/auth/google/callback',
        scope: ['email', 'profile'],
      });
    } else {
      super({
        clientID: config.auth.google.app_id,
        clientSecret: config.auth.google.app_secret,
        callbackURL: config.auth.google.callback,
        scope: ['email', 'profile'],
      });
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const config = appConfig();

    // If Google OAuth is not configured, reject the authentication
    if (!config.auth.google.app_id || !config.auth.google.app_secret) {
      return done(new Error('Google OAuth is not configured. Please set GOOGLE_APP_ID and GOOGLE_APP_SECRET environment variables.'), null);
    }

    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
