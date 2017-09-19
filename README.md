# nypr-auth

_Provides close-to-the metal utilities for authenticating and authorizing users across NYPR properties._

This addon leverages [`torii`](https://github.com/Vestorly/torii) in combination with [`ember-simple-auth`](https://github.com/simplabs/ember-simple-auth) to handle auth and session state. Torii is used to handle interacting with third-party auth providers such as Facebook, and ESA is used to manage session state, authenticating, and authorizing outgoing requests.

## Provided Features

### User Model/Adapter/Serializer

This addon provides an ember-data model, adapter, and serializer for a `user`, configured to interact with NYPR's auth back-end microservice.

#### Model Fields
Note this are subject to change in the future.
```javascript
email:              attr('string'),
givenName:          attr('string'),
familyName:         attr('string'),
preferredUsername:  attr('string'),
picture:            attr('string'),
facebookId:         attr('string'),
status:             attr('string'),

socialOnly:         equal('status', 'FORCE_CHANGE_PASSWORD'),
hasPassword:        not('socialOnly')
```

#### Network Requests

Interacting with the backend service should be handled by other, higher-level addons, such as the [nypr-account-settings](https://github.com/nypublicradio/nypr-account-settings), but for reference, the requests related to the user model will be listed here. The expected [config values](#config-values) are detailed further below. Config values will be notated in angle brackets.

Auth headers are added to all outgoing user-related requests.
* `X-Provider`: string value hint for back end service if a third-party service (e.g. Facebook) provided the auth token
* `Authorization`: a hashed, encoded auth token

See the [auth microservice REST docs](http://docs.nyprauth.apiary.io) for more information.

#### Get Current User
```
GET <authAPI>/v1/session
```

The call to the store to retrieve the current user is actually a `query`, instead of a `findRecord`, which is what the `ember-data` semantics would dictate. The reason for this is described in [this guide from `ember-simple-auth` on managing the current user](https://github.com/simplabs/ember-simple-auth/blob/master/guides/managing-current-user.md). This addon follows the pattern outlined there very closely.

#### Create a User
Post body is an object of field names and values for the new user.
```
POST <authAPI>/v1/user
```

#### Update a User 
```
PATCH <authAPI>/v1/user
```
Outgoing `PATCH` requests only include values for the fields that are changing, as specified by the JSON merge patch strategy outlined here: https://tools.ietf.org/html/rfc7396.

#### Delete a User
```
DELETE <authAPI>/v1/user
```

### Authenticators and Authorizers

#### `nypr` authenticator
A basic extension of ESA's `OAuth2PasswordGrantAuthenticator`, specifying the `serverTokenEndpoint` as `<authAPI>/v1/session`.

#### `torii` authenticator
Overrides the `authenticate` and `getSession` methods of the basic torii authenticator to communicate with our auth service back end when a user to credentialed via a third-party API.

#### `nypr` authorizer
The `nypr` authorizer is how the `X-Provider` header is added to outgoing requests. The auth backend uses this as a hint to determine which third-party server-side auth API it should use (if any) to authenticate the incoming access token.

### Services

#### `current-user`
A useful service for upstream apps to get the current user model. If a user is authenticated, it returns an ember-data record with their information as retrieved from the auth back end. If the current access token is invalid, ESA will wipe any local data for security purposes an reload the app.

##### Methods and Attributes

###### `load`
`Function`

Call this as early as possible in your app to fetch the current authenticated user.

###### `user`
`Object`

The currently loaded user as an ember-data record.

**Examples**

```js
// app/routes/application.js
export default Route.extend({
  currentUser: Ember.service.inject(),
  
  beforeModel() {
    this.get('currentUser').load(); // makes a call to the back end and will set
                                    // the results to `user` when it resolves
                                    // if the session is not authenticated, this is a 
                                    // no op. if the session is expired or otherwise
                                    // rejected by the server, this will reload the app
  },
  
  model() { ... }
})
```

```handlebars
{{!-- app/templates/application --}}
{{#if currentUser.user}}
Hello {{currentUser.user.firstName}}!
{{else}}
Hello anonymous!
{{/if}}
```

#### `session`
The `session` service provided by `nypr-auth` is an extension of ESA's `session` service. The additional methods are listed below.

##### Methods

###### `syncBrowserId`
`browserId` is how we track anonymous user sessions via `Etag` server headers managed by the `publisher` backend.

Please used the `syncBrowserId` method as early as possible in your app in order to get a session ID. The `browserId` is saved in `localStorage` as part of non-authenticated ESA session data, so it will persist across windows and logouts. `syncBrowserId` will first check for an existing `browserId` before fetching a new once. In the case when it finds out, it will alter the request so that it is reporting an existing ID to publisher rather than requesting a new one.

###### `staffAuth`
If someone is logged in as a staff user, there are additional editorial controls an app may choose to display. The `staffAuth` method will check against an admin endpoint and update session data with an `isStaff` boolean and a `staffName` value if the user is an admin. More staff attributes may be added in the future.

###### `verify`
This method can be used to perform a basic check against the auth service with a provided email and password. It allows for an app to assert given credentials are valid without triggering ESA's framework events regarding successful and unsuccessful validation attempts.

## Config Values
This addon requires a small set of config values in order for it to connect to the correct back end services.

##### `authAPI`
The host of the `auth` microservice backend. Used for most auth-related requests.

##### `adminRoot`
Publisher's admin backend host. Used to see if the current session is authenticated as a staff user.

##### `etagAPI`
The full host and pathname to the `browserID` endpoint. It's currently named `EtagAPI` for legacy reasons, but that is subject to change.


## Installation

* `git clone git@github.com:nypublicradio/nypr-auth.git` this repository
* `cd nypr-auth`
* `yarn`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `yarn test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
