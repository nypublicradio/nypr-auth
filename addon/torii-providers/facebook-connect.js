import FacebookConnectProvider from 'torii/providers/facebook-connect';

export default FacebookConnectProvider.extend({

  init(){
    if (typeof document === 'undefined') {
      // don't run in fastboot
      return;
    }
    this._super(...arguments);
  }

});
