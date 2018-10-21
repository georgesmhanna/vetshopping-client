import {SocialLoginModule, AuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider} from 'angularx-social-login';
import {environment} from '../environments/environment';

export function getAuthServiceConfigs() {
    let config = new AuthServiceConfig([
        {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(environment.googleClientId)
        },
        {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider(environment.facebookClientId)
        }
    ]);

    return config;
}