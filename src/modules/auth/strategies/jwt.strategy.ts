import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import appConfig from '../../../config/app.config'; // Your app config file

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: appConfig().jwt.secret, // Ensure your secret matches the one used when signing the token
      ignoreExpiration: false,  // You may want to change this to `false` if you care about expiration
    });
  }

  async validate(payload: any) {
    // console.log('JWT Payload:', payload);  // Log the payload for debugging
    return {
      id: payload.id,
      email: payload.email,
      type: payload.type,
      owner_id: payload.owner_id,
      workspace_id: payload.workspace_id,
    };
  }
}
