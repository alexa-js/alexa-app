# alexa-app

A Node module to simplify development of Alexa apps using Node.js

# Installation

```bash
	npm install alexa-app --save
```

# Example App

The *[alexa-app-server](https://github.com/matt-kruse/alexa-app-server/)* project is a fully working example of using alexa-app to build an Alexa application using Node.js.

# Summary

alexa-app does the dirty work of interpretting the JSON request from Amazon and building the JSON response. It provides convenience methods to more easily build the response, handle session objects, and add cards. It also makes it easy to run multiple endpoints (apps) on one Node.js server instance.

# Usage

```javascript
var alexa = require('alexa-app');
var app = new alexa.app('sample');

app.intent('number',function(request,response) {
  var number = request.slot('number');
  response.say("You asked for the number "+number);
});

express.post('/sample',app.request);
```

# Examples

## LaunchRequest

```javascript
app.launch(function(request,response) {
  response.say("Hello World");
  response.card("Hello World","This is an example card");
});
```

## IntentRequest

Define the handler for multiple intents using multiple calls to intent().

```javascript
app.intent('buy', function(request,response) {
	response.say("You bought a "+request.slot("item"));
});
app.intent('sell', function(request,response) {
	response.say("You sold your items!");
});
```

## SessionEndRequest

```javascript
app.sessionEnded(function(request,response) {
	logout( request.userId );
	// No response necessary
});
```

## Keep a session open

By default the session is closed after each request.

```javascript
app.intent('guess', function(request,response) {
	response.say("Guess again!");
	response.shouldEndSession(false);
});
```

## Read/write session data

```javascript
app.launch(function(request,response) {
	response.session('number',42);
	response.say("Would you like to know the number?");
	response.shouldEndSession(false);
});
app.intent('tellme', function(request,response) {
	response.say("The number is "+request.session('number'));
});
```

## Access the raw http request/response

```javascript
app.launch(function(request,response,http_req,http_res) {
	log( http_req.ip );
});
```

## Attach multiple apps to express

```javascript
var server = express();
var alexa = require('alexa-app');

var app1 = new alexa.app('hello');
app1.launch(function(request,response) {
  response.say("Hello");
});

var app2 = new alexa.app('world');
app2.launch(function(request,response) {
  response.say("World");
});

// Prefix all apps with /alexa/ => ex: /alexa/hello
alexa.bootstrap(server,"/alexa/");
```

## Define a custom endpoint name for an app

```javascript
var app = new alexa.app('hello','myEndpointName');
```
