'use strict';

module.exports = {
  name: 'nypr-auth',
  included: function() {
    this._super.included.apply(this, arguments);
  },
  isDevelopingAddon: () => true
};
