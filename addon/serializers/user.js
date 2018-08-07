import DS from 'ember-data';
import { underscore } from '@ember/string';

export default DS.JSONAPISerializer.extend({
  attrs: {
    facebookId: 'custom:facebook_id'
  },
  keyForAttribute: attr => underscore(attr),
  serialize(snapshot, options) {
    let { data : { attributes:json } } = this._super(snapshot, options);
    let typedPassword = snapshot.record.get('typedPassword');

    if (typedPassword) {
      json = Object.assign(json, { password: snapshot.record.get('typedPassword') });
    }

    let captchaKey = snapshot.record.get('captchaKey');
    if (captchaKey) {
      json = Object.assign(json, { captcha_key: snapshot.record.get('captchaKey') });
    }
    return json;
  }
});
