import FacebookConnectProvider from 'torii/providers/facebook-connect';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { get } from '@ember/object';

export default FacebookConnectProvider.extend({
  fastboot: service(),
  isFastBoot: reads('fastboot.isFastBoot'),

  init() {
    if(get(this, 'isFastBoot')) {
      return;
    }
    else {
      this._super(...arguments);
    }
  },
});
