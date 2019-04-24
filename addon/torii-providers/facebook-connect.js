import FacebookConnectProvider from 'torii/providers/facebook-connect';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { get } from '@ember/object';

export default FacebookConnectProvider.extend({
  fastboot: service(),
  isFastboot: reads('fastboot.isFastboot'),

  fetch(data) {
    if(get(this, 'isFastboot')) {
      return;
    }
    return data;
  }
});
