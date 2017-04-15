# Upgrading Alexa-app

### Upgrading to >= 4.0.1

#### Changes session details syntax

The session details now match the session object in the request. User data has therefore changed and the old methods deprecated, specifically `userId` and `accessToken`.

Before:

```javascript
// Get userId (marked as deprecated)
request.getSession().details.userId;
// Get accessToken (marked as deprecated)
request.getSession().details.accessToken;
```

After:

```javascript
// Get userId
request.getSession().details.user.userId;
// Get accessToken
request.getSession().details.user.accessToken;
```

See [#215](https://github.com/alexa-js/alexa-app/pull/215) for more information.

### Upgrading to >= 4.0.0

#### Changes to Asynchronous Support

Support for asynchronous `pre` and `post` as well as all handlers such as the intent and launch handlers is now done through promises. This allows `pre` and `post` to be asynchronous.

You can no longer make these handlers asynchronous by using `return false`. A callback is no longer taken as an argument to these handlers. Instead if you want your handler to be asynchronous you may return a promise.

`response.send` and `response.fail` now return promises. If you call either, you must return them in order to continue the promise chain for any asynchronous functionality. If you return a promise but do not explicitly call `response.send` it will be called automatically when the returned promise resolves. If you want to trigger a failure, `return response.fail(error)` and `throw error` have the same effect. If a promise returned from a handler is rejected it will be treated as if you had called explicit failure as well.

Before:
```javascript
app.intent("tellme", (request, response) => {
  http.get(url, rc => {
    if (rc.statusText >= 400) {
      response.fail();
    } else {
      response.send(rc.body);
    }
  });

  return false;
});
```

After:
```javascript
app.intent("tellme", (request, response) => {
  // `getAsync` returns a Promise in this example
  return http.getAsync(url).then(rc => {
    if (rc.statusText >= 400) {
      return response.fail();
    } else {
      return response.send(rc.body);
    }
  });
});
```

#### Changes to ExpressJS Support

Express.js integration via `app.express()` now requires one of `expresApp` or `router`. When using a router, it will no longer be automatically mounted inside the express app and you may need to implement that outside of this call.

The old usage of passing both `expressApp` and `router` is deprecated.

##### Use default endpoint

before:
```javascript
var express_app = express();
var app = new alexa.app("sample");
app.express({ expressApp: express_app, router: express.Router() });
// now POST calls to /sample in express will be handled by the app.request() function
```

after:
```javascript
var express_app = express();
var app = new alexa.app("sample");
app.express({ expressApp: express_app });
// now POST calls to /sample in express will be handled by the app.request() function
```

##### Use specified endpoint

before:
```javascript
var express_app = express();
var app = new alexa.app("sample");
app.express({ expressApp: express_app, router: express.Router(), endpoint: 'api/alexa' });
// now POST calls to /api/alexa in express will be handled by the app.request() function
```

after:
```javascript
var express_app = express();
var apiRouter = express.Router();
var app = new alexa.app("sample");
app.express({ router: apiRouter, endpoint: '/alexa' });
express_app.use('/api', apiRouter);
// now POST calls to /api/alexa in express will be handled by the app.request() function
```

#### Lambda `callback` used by default over `context`
Since version 4.0.0, the [`callback`](http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html#nodejs-prog-model-handler-callback)
parameter that the lambda function takes is used to complete
the request. Prior to 3.0.0, the context object with its
`success` and `fail` methods were used.

If you want to use the built in lambda functionality, you
*must* run on NodeJS 4.3.

Also note that the callback will wait for an empty event
loop before triggering. If your lambda function relies on
triggering the response before the event loop is empty, you
must set `context.callbackWaitsForEmptyEventLoop = false`
to maintain this functionality:

```
export function handler(event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false;
    alexaAppInstance.request(event)
        .then(response => {
            callback(null, response);
        })
        .cacth(error => {
            callback(error);
        });
};
```

### Upgrading to >= 3.0.0

#### Changes in Express integration interface

The interface for mounting alexa-app with Express.js has changed from taking the app, path and debug option to receiving an object.

Before:

```javascript
app.express(express_app, "/echo/", false);
```

After:

```javascript
app.express({
  expressApp: express_app,
  router: express.Router(),
  endpoint: "/echo/",
  checkCert: true,
  debug: false,
  preRequest: function(request_json, req, res) { },
  postRequest: function(response_json, req, res) { }
});
```

See [#144](https://github.com/alexa-js/alexa-app/pull/144) and [#150](https://github.com/alexa-js/alexa-app/pull/150) for more information.

#### Changes in body-parsers

The `.urlencoded` body-parser has been removed.

The `.json` body-parser is only mounted when `checkCert: false`, because `verifier-middleware` acts as a body-parser as well.

See [#155](https://github.com/alexa-js/alexa-app/pull/155) for more information.

#### Changed session object behavior

When working with the session, `session.get` will return a deep copy of the value stored in the session. If this value is an object and you make direct changes to the object, you must call `session.set` again in order for the changes to propagate to the session.

See [#118](https://github.com/matt-kruse/alexa-app/pull/118) for more information.

### Upgrading to >= 2.4.0

#### Changed session interface

These methods and properties marked as deprecated:
* `request.sessionDetails`
* `request.sessionId`
* `request.sessionAttributes`
* `request.isSessionNew`
* `request.session()`
* `response.session()`
* `response.clearSession()`

Please use the `session` object from `request.getSession()` instead:

```javascript
// check if the request has session
if (request.hasSession()) {
  // get session object
  var session = request.getSession();
  // check if the session is new
  session.isNew();
  // set a session variable
  session.set("foo", "bar");
  // get a session variable (copies objects)
  session.get("foo");
  // delete one session variable
  session.clear("foo");
  // or clear all session variables
  session.clear();
  // get sessionId
  session.sessionId;
  // get session details
  session.details;
  // get session attributes (object of variables)
  // NOTE: Working directly with these circumvents the deep
  // copy returned by `session.get`
  session.attributes;
}
```

You can easily use the session, but first you need to check if `request` has session: `Boolean request.hasSession()`. Otherwise the session properties will be empty and the session functions will throw "NO_SESSION" exception.

See [#91](https://github.com/matt-kruse/alexa-app/pull/91) for more information.
