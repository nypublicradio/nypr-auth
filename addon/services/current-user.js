import Service, { inject } from '@ember/service';

export default Service.extend({
  session: inject('session'),
  store: inject(),

  load() {
    if (this.get('session.isAuthenticated')) {
      let user = this.get('store').queryRecord('user', {me: true});
      this.set('user', user);
      return user
      .catch(() => {
        // this access token has since been revoked
        this.get('session').invalidate();
      });
    }
  }
});
