import SessionService from 'ember-simple-auth/services/session';
import config from 'ember-get-config';
import RSVP from 'rsvp';
import fetch from 'fetch';
import { getOwner } from '@ember/application';
import { isEmpty } from '@ember/utils';


export default SessionService.extend({
  syncBrowserId() {
    let legacyId;
    try {
      legacyId = window.localStorage.getItem('browserId');
      if (legacyId) {
        window.localStorage.removeItem('browserId');
      }
    } catch(e) {
      if (e.name === "SecurityError") {
        console.warn("Cookies are disabled. No local settings allowed."); // eslint-disable-line no-console
        return RSVP.Promise.resolve(null);
      }
    }

    return fetch(config.etagAPI, {credentials: 'include'})
      .then(checkStatus)
      .then(response => response.json())
      .then( ({ browser_id }) => this.set('data.browserId', browser_id));
  },

  staffAuth() {
    return fetch(`${config.adminRoot}/api/v1/is_logged_in/?bust_cache=${Math.random()}`, {
      credentials: 'include'
    })
    .then(checkStatus).then(r => r.json())
    .then(data => {
      let { is_staff, name } = data;
      this.setProperties({
        'data.isStaff': is_staff,
        'data.staffName': name
      });
      return data;
    });
  },

  verify(email, password) {
    let authenticator = getOwner(this).lookup('authenticator:nypr');
    return authenticator.authenticate(email, password);
  },

  authorize(header) {
    let { provider, access_token } = this.get('data.authenticated');

    try {
      header['Authorization'] = `Bearer ${access_token}`;
      if (!isEmpty(provider)) {
        header['X-Provider'] = provider;
      }
    }
    catch(error) {
      console.warn(error); // eslint-disable-line no-console
    }
    return header;
  },
});

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}
