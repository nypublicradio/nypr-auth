import FacebookConnectProvider from 'torii/providers/facebook-connect';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

export default FacebookConnectProvider.extend({
  fastboot: service(),
  isFastboot: reads('fastboot.isFastBoot'),

  init(){
    if (typeof document === 'undefined') {
      // don't run in fastboot
      return;
    }
    this._super(...arguments);
  }

});
