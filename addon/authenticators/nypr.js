import config from 'ember-get-config';
import OAuth2PasswordGrantAuthenticator from 'ember-simple-auth/authenticators/oauth2-password-grant';

export default OAuth2PasswordGrantAuthenticator.extend({
  serverTokenEndpoint: `${config.authAPI}/v1/session`
});
