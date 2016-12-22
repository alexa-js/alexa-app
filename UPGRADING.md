# Upgrading Alexa-app

### Upgrading to >= 2.3.5

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
  // get a session variable
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
  session.attributes;
}
```

You can easily use the session, but first you need to check if `request` has session: `Boolean request.hasSession()`. Otherwise the session properties will be empty and the session functions will throw "NO_SESSION" exception.

See [#91](https://github.com/matt-kruse/alexa-app/pull/91) for more information.

