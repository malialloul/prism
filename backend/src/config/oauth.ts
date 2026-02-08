// OAuth configuration for Google and GitHub
import { config } from './env';

export const oauthConfig = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: 'email profile',
    clientId: config.oauth.google.clientId,
    clientSecret: config.oauth.google.clientSecret,
    redirectUri: `${config.oauth.callbackBaseUrl}/auth/oauth/google/callback`,
  },
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    userEmailsUrl: 'https://api.github.com/user/emails',
    scope: 'user:email',
    clientId: config.oauth.github.clientId,
    clientSecret: config.oauth.github.clientSecret,
    redirectUri: `${config.oauth.callbackBaseUrl}/auth/oauth/github/callback`,
  },
  frontendUrl: config.oauth.frontendUrl,
};

export type OAuthProvider = 'google' | 'github';

export interface OAuthUserInfo {
  email: string;
  name: string;
  provider: OAuthProvider;
  providerId: string;
  avatarUrl?: string;
}
