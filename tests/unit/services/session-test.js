import { module } from 'qunit';
import { setupTest } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import * as fetch from 'fetch';
import sinon from 'sinon';
import config from 'ember-get-config';

const ETAG_API = 'http://example.com';
const BROWSER_ID = 1234567890;
config.etagAPI = ETAG_API;

module('Unit | Service | session', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.server = sinon.createFakeServer({
      respondImmediately: true
    });

    this.server.respondWith(ETAG_API, `{"browser_id": ${BROWSER_ID}}`);
  });

  hooks.afterEach(function() {
    this.server.restore();
  });

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let service = this.owner.lookup('service:session');
    assert.ok(service);
  });

  test('it gets a browser id from the etagAPI', async function(assert) {
    let fetchSpy = this.spy(fetch, 'default');
    let service = this.owner.lookup('service:session');

    await service.syncBrowserId();

    assert.ok(fetchSpy.calledWith(ETAG_API, {credentials: 'include'}), 'must includes cookies');
    assert.equal(service.get('data.browserId'), BROWSER_ID);
  });


  test('it requests browser id even if a value is already set', async function(assert) {
    let fetchSpy = this.spy(fetch, 'default');
    let service = this.owner.lookup('service:session');
    service.set('data.browserId', 'local value');

    await service.syncBrowserId();
    assert.ok(fetchSpy.calledWithExactly(ETAG_API, {credentials: 'include'}), 'must include cookies');
  });

  test('an existing local storage value is replaced with a value from the server', async function(assert) {
    let fetchSpy = this.spy(fetch, 'default');
    let service = this.owner.lookup('service:session');
    service.set('data.browserId', 'local value');

    await service.syncBrowserId();

    assert.ok(fetchSpy.calledWithExactly(ETAG_API, {credentials: 'include'}), 'must include cookies');
    assert.equal(service.get('data.browserId'), BROWSER_ID, 'local value is overwritten');
  });

  test('if a legacy ID is found, clear it and defer to the new one', async function(assert) {
    const LEGACY_ID = 'legacy id';
    this.stub(window.localStorage, 'getItem').returns(LEGACY_ID);
    this.mock(window.localStorage).expects('removeItem').once().withArgs('browserId');
    let fetchSpy = this.spy(fetch, 'default');
    let service = this.owner.lookup('service:session');

    await service.syncBrowserId();

    assert.ok(fetchSpy.calledWith(ETAG_API, {credentials: 'include'}), 'must includes cookies');
    assert.equal(service.get('data.browserId'), BROWSER_ID);
  });

  test('if cookies are disabled, resolve null', function(assert) {
    this.stub(window.localStorage, 'getItem').throws({name: 'SecurityError'});
    let service = this.owner.lookup('service:session');
    let fetchSpy = this.spy(fetch, 'default');

    service.syncBrowserId();

    assert.ok(fetchSpy.notCalled, 'must includes cookies');
    assert.notOk(service.get('data.browserId'));
  });
});
