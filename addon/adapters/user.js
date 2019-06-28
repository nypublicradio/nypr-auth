import config from 'ember-get-config';
import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import AdapterFetch from 'ember-fetch/mixins/adapter-fetch';
const { keys } = Object;

export default DS.JSONAPIAdapter.extend( AdapterFetch, DataAdapterMixin, {
  // we are replacing authorize() here, since ember-fetch (needed for FastBoot)
  // overrides ember-simple-auth's ajaxOptions method, which calls authorize().
  // So instead, we do what we used to do in authorize() right here.
  ajaxOptions(...args) {
    const options = this._super(...args);
    options.headers = options.headers ? options.headers : {};
    let headers = this.get('session').authorize({});
    for (var h in headers) {
      options.headers[h] = headers[h];
    }

    return options;
  },

  host: config.authAPI,
  buildURL(modelName, id, snapshot, requestType, query) {
    if (/createRecord|updateRecord|deleteRecord/.test(requestType)) {
      return `${this.host}/v1/user`;
    } else if (requestType.startsWith('query')) {
      delete query.me;
      return `${this.host}/v1/session`;
    }
  },

  // conform with JSON merge patch strategy: "only send what you need"
  // https://tools.ietf.org/html/rfc7396
  updateRecord(store, type, snapshot) {
    let data = {};
    let serializer = store.serializerFor(type.modelName);
    let url = this.buildURL(type.modelName, snapshot.id, snapshot, 'updateRecord');
    let changed = keys(snapshot.record.changedAttributes())
      .map(key => serializer.attrs[key] || serializer.keyForAttribute(key));

    serializer.serializeIntoHash(data, type, snapshot, { includeId: true });

    keys(data).forEach(k => {
      if (!changed.includes(k)) {
        delete data[k];
      }
    });

    return this.ajax(url, 'PATCH', { data: data });
  },

  createRecord(store, type, {record, adapterOptions}) {
    // at this point we're still unauthenticated, so we need to manually add
    // required X-Provider and Authorization headers for sign up via third-
    // party providers e.g. facebook
    if (adapterOptions && adapterOptions.provider) {
      this.set('headers', {
        'X-Provider': adapterOptions.provider,
        'Authorization': `Bearer ${record.get('providerToken')}`
      });
    } else {
      this.set('headers', undefined);
    }
    return this._super(...arguments);
  }
});
