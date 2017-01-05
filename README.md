# alexa-app

[![Build Status](https://travis-ci.org/matt-kruse/alexa-app.svg?branch=master)](https://travis-ci.org/matt-kruse/alexa-app)
[![Coverage Status](https://coveralls.io/repos/github/matt-kruse/alexa-app/badge.svg?branch=master)](https://coveralls.io/github/matt-kruse/alexa-app?branch=master)

A Node module to simplify development of Alexa apps (Skills) using Node.js.

# Installation

```bash
	npm install alexa-app --save
```

# Stable Release

You're reading the documentation for the stable release of alexa-app, 2.4.0. Please see [CHANGELOG](CHANGELOG.md) and make sure to read [UPGRADING](UPGRADING.md) when upgrading from a previous version.

# Summary

The alexa-app module does the dirty work of interpretting the JSON request from the Alexa platform and building the JSON response that can be spoken on an Alexa-compatible device, such as the Echo. It provides a DSL for defining intents, convenience methods to more easily build the response, handle session objects, and add cards.

The intent schema definition and sample utterances can be included in your application's definition, making it very simple to generate hundreds (or thousands!) of sample utterances with a few lines.

# Features

- Simplified handling of requests and generating responses
- Support for asynchronous handlers
- Easy connection into AWS Lambda or Node.js Express, etc.
- Auto-generation of intent schema and sample utterances
- Convenience handling of session data
- Support for testing

# Example Usage

```javascript
var alexa = require("alexa-app");
var app = new alexa.app("sample");

app.intent("number", {
    "slots": { "number": "NUMBER" },
    "utterances": ["say the number {1-100|number}"]
  },
  function(request, response) {
    var number = request.slot("number");
    response.say("You asked for the number " + number);
  }
);
```

See the [example](example) directory for a sample implementation.

# API

Apps ("skills") define handlers for launch, intent, and session end, just like normal Alexa development. The alexa-app module provides a layer around this functionality that simplifies the interaction. Each handler gets passed a request and response object, which are custom for this module.

## request

```javascript
// return the type of request received (LaunchRequest, IntentRequest, SessionEndedRequest)
String request.type()

// return the value passed in for a given slot name
String request.slot("slotName")

// check if you can use session (read or write)
Boolean request.hasSession()

// return the session object
Session request.getSession()

// return the request context
request.context

// the raw request JSON object
request.data
```

## response

The response JSON object is automatically built for you. All you need to do is tell it what you want to output.

```javascript
// tell Alexa to say something; multiple calls to say() will be appended to each other
// all text output is treated as SSML
response.say(String phrase)

// empty the response text
response.clear()

// tell Alexa to re-prompt the user for a response, if it didn't hear anything valid
response.reprompt(String phrase)

// return a card to the user's Alexa app
// for Object definition @see https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#card-object
// skill supports card(String title, String content) for backwards compat of type "Simple"
response.card(Object card)

// return a card instructing the user how to link their account to the skill
// this internally sets the card response
response.linkAccount()

// play audio stream (send AudioPlayer.Play directive) @see https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-audioplayer-interface-reference#play-directive
// skill supports stream(String url, String token, String expectedPreviousToken, Integer offsetInMilliseconds)
response.audioPlayerPlayStream(String playBehavior, Object stream)

// stop playing audio strem (send AudioPlayer.Stop directive)
response.audioPlayerStop()

// clear audio player queue (send AudioPlayer.ClearQueue directive)
// clearBehavior is "CLEAR_ALL" by default
response.audioPlayerClearQueue([ String clearBehavior ])

// tell Alexa whether the user's session is over; sessions end by default
// you can optionally pass a reprompt message
response.shouldEndSession(boolean end [, String reprompt] )

// send the response to the Alexa device (success)
// this is not required for synchronous handlers
// you must call this from asynchronous handlers
response.send()

// trigger a response failure
// the internal promise containing the response will be rejected, and should be handled by the calling environment
// instead of the Alexa response being returned, the failure message will be passed
response.fail(String message)

// calls to response can be chained together
response.say("OK").send()
```

## session
```javascript
// check if you can use session (read or write)
Boolean request.hasSession()

// get the session object
var session = request.getSession()

// set a session variable
// by defailt, Alexa only persists session variables to the next request
// the alexa-app module makes session variables persist across multiple requests
session.set(String attributeName, String attributeValue)

// return the value of a session variable
String session.get(String attributeName)

// session details, as passed by Amazon in the request
session.details = { ... }
```

# Request Handlers

Your app can define a single handler for the `Launch` event and the `SessionEnded` event, and multiple intent handlers.

## LaunchRequest

```javascript
app.launch(function(request, response) {
  response.say("Hello World");
  response.card("Hello World", "This is an example card");
});
```

## IntentRequest

Define the handler for multiple intents using multiple calls to `intent()`. Intent schema and sample utterances can also be passed to `intent()`, which is detailed below. Intent handlers that don't return an immediate response (because they do some asynchronous operation) must return `false`. See example further below.

```javascript
app.intent("live", {
    "slots": {
      "city": "AMAZON.US_CITY"
    },
    "utterances": [
      "in {-|city}"
    ]
  }, function(request, response) {
    response.say("You live in " + request.slot("city"));
  }
);

app.intent("vacation", function(request, response) {
  response.say("You're now on vacation.");
});
```

## SessionEndRequest

```javascript
app.sessionEnded(function(request, response) {
  // cleanup the user's server-side session
  logout(request.userId);
  // no response required
});
```

## AudioPlayer Event Request

Define the handler for multiple events using multiple calls to `audioPlayer()`. You can define only one handler per event. Event handlers that don't return an immediate response (because they do some asynchronous operation) must return false.

You can define handlers for the following events:

* PlaybackStarted
* PlaybackFinished
* PlaybackStopped
* PlaybackNearlyFinished
* PlaybackFailed

Read more about AudioPlayer request types in [AudioPlayer Interface Doc](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-audioplayer-interface-reference#audioplayer-requests).

The following example will return `play` directive with a next audio on `AudioPlayer.PlaybackNearlyFinished` request.

```javascript
app.audioPlayer("PlaybackNearlyFinished", function(request, response) {
  // immediate response
  var stream = {
    "url": "https://next-song-url",
    "token": "some_token",
    "expectedPreviousToken": "some_previous_token",
    "offsetInMilliseconds": 0
  };
  response.audioPlayerPlayStream("ENQUEUE", stream);
});
```

See an example of asynchronous response below.

```javascript
app.audioPlayer("PlaybackFinished", function(request, response) {
  // async response
  getNextSongFromDB(function(url, token) {
    var stream = {
      "url": url,
      "token": token,
      "expectedPreviousToken": "some_previous_token",
      "offsetInMilliseconds": 0
    };
    response.audioPlayerPlayStream("ENQUEUE", stream);
    response.send();
  });
  return false;
});
```

# Execute Code On Every Request

In addition to specific event handlers, you can define functions that will run on every request.

## pre()

Executed before any event handlers. This is useful to setup new sessions, validate the `applicationId`, or do any other kind of validations.

```javascript
app.pre = function(request, response, type) {
  if (request.applicationId != "amzn1.echo-sdk-ams.app.000000-d0ed-0000-ad00-000000d00ebe") {
    // fail ungracefully
    response.fail("Invalid applicationId");
  }
};
```

Note that the `post()` method still gets called, even if the `pre()` function calls `send()` or `fail()`. The post method can always override anything done before it.

## post()

The last thing executed for every request. It is even called if there is an exception or if a response has already been sent. The `post()` function can change anything about the response. It can even turn a `response.fail()` into a `respond.send()` with entirely new content. If `post()` is called after an exception is thrown, the exception itself will be the 4th argument.

```javascript
app.post = function(request, response, type, exception) {
  if (exception) {
    // always turn an exception into a successful response
    response.clear().say("An error occured: " + exception).send();
  }
};
```

# Schema and Utterances

The alexa-app module makes it easy to define your intent schema and generate many sample utterances. Optionally pass your schema definition along with your intent handler, and extract the generated content using the `schema()` and `utterances()` functions on your app.

## Schema Syntax

Pass an object with two properties: slots and utterances.

```javascript
app.intent("sampleIntent", {
    "slots": {
      "NAME": "AMAZON.US_FIRST_NAME",
      "AGE": "AMAZON.NUMBER"
    },
    "utterances": [
      "my {name is|name's} {NAME} and {I am|I'm} {1-100|AGE}{ years old|}"
    ]
  },
  function(request, response) {

  }
);
```

### slots

The slots object is a simple `name: type` mapping. The type must be one of Amazon's [built-in slot types](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/built-in-intent-ref/slot-type-reference), such as `AMAZON.DATE` or `AMAZON.NUMBER`.

### custom slot types

[Custom slot types](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interaction-model-reference#Custom Slot Type Syntax) are supported via the following syntax.

```javascript
app.intent("sampleIntent", {
    "slots": {
      "CustomSlotName": "CustomSlotType"
    },
    "utterances": [
      "airport {information|status} for {-|CustomSlotName}"
    ]
  },
  function(request, response) {... }
);
```

This will result in the following utterance list.

```
sampleIntent     airport information for {CustomSlotName}
sampleIntent     airport status for {CustomSlotName}
```

Note that the "CustomSlotType" type values must be specified in the Skill Interface's Interaction Model for the custom slot type to function correctly.

### utterances

The utterances syntax allows you to generate many (hundreds or even thousands) of sample utterances using just a few samples that get auto-expanded. Any number of sample utterances may be passed in the utterances array. Below are some sample utterances macros and what they will be expanded to.

#### Multiple Options mapped to a Slot

```javascript
"my favorite color is {red|green|blue|NAME}"
=>
"my favorite color is {red|NAME}"
"my favorite color is {green|NAME}"
"my favorite color is {blue|NAME}"
```

#### Generate Multiple Versions of Static Text

This lets you define multiple ways to say a phrase, but combined into a single sample utterance.

```javascript
"{what is the|what's the|check the} status"
=>
"what is the status"
"what's the status"
"check the status"
```

#### Auto-Generated Number Ranges

When capturing a numeric slot value, it's helpful to generate many sample utterances with different number values.

```javascript
"buy {2-5|NUMBER} items"
=>
"buy {two|NUMBER} items"
"buy {three|NUMBER} items"
"buy {four|NUMBER} items"
"buy {five|NUMBER} items"
```

Number ranges can also increment in steps.

```javascript
"buy {5-20 by 5|NUMBER} items"
=>
"buy {five|NUMBER} items"
"buy {ten|NUMBER} items"
"buy {fifteen|NUMBER} items"
"buy {twenty|NUMBER} items"
```

#### Optional Words

```javascript
"what is your {favorite |}color"
=>
"what is your color"
"what is your favorite color"
```

#### Using a Dictionary

Several intents may use the same list of possible values, so you want to define them in one place, not in each intent schema. Use the app's dictionary.

```javascript
app.dictionary = {"colors":["red","green","blue"]};
...
"my favorite color is {colors|FAVEORITE_COLOR}"
"I like {colors|COLOR}"
```

## Generating Schema and Utterances Output

To get the generated content out of your app, call the `schema()` and `utterances()` functions. See [example/express.js](example/express.js) for one way to output this data.

```javascript
// returns a String representation of the JSON object
app.schema() =>

{
  "intents": [{
    "intent": "MyColorIsIntent",
    "slots": [{
      "name": "Color",
      "type": "AMAZON.Color"
    }]
  }]
}

app.utterances() =>

MyColorIsIntent  my color is {dark brown|Color}
MyColorIsIntent  my color is {green|Color}
MyColorIsIntent  my favorite color is {red|Color}
MyColorIsIntent  my favorite color is {navy blue|Color}
WhatsMyColorIntent whats my color
WhatsMyColorIntent what is my color
WhatsMyColorIntent say my color
WhatsMyColorIntent tell me my color
WhatsMyColorIntent whats my favorite color
WhatsMyColorIntent what is my favorite color
WhatsMyColorIntent say my favorite color
WhatsMyColorIntent tell me my favorite color
WhatsMyColorIntent tell me what my favorite color is
```

# Cards

The `response.card(Object card)` method allows you to send [Home Cards](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/providing-home-cards-for-the-amazon-alexa-app) on the Alexa app, the companion app available for Fire OS, Android, iOS, and desktop web browsers.

The full specification for the `card` object passed to this method can be found [here](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#card-object).

Card's do not support SSML

If you just want to display a card that presents the user to link their account call `response.linkAccount()` as a shortcut.

## Card Examples

Display text only, aka [Simple](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/providing-home-cards-for-the-amazon-alexa-app#Creating%20a%20Basic%20Home%20Card%20to%20Display%20Text).

```javascript
response.card({
  type: "Simple",
  title: "My Cool Card", // this is not required for type Simple
  content: "This is the\ncontent of my card"
});
```

Display text and image, aka [Standard](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/providing-home-cards-for-the-amazon-alexa-app#Creating%20a%20Home%20Card%20to%20Display%20Text%20and%20an%20Image).

Make sure to read the restrictions on hosting the images. Must support CORS AND SSL cert signed by an Amazon approved certification authority.

```javascript
response.card({
  type: "Standard",
  title: "My Cool Card", // this is not required for type Simple or Standard
  text: "Your ride is on the way to 123 Main Street!\nEstimated cost for this ride: $25",
  image: { // image is optional
    smallImageUrl: "https://carfu.com/resources/card-images/race-car-small.png", // required
    largeImageUrl: "https://carfu.com/resources/card-images/race-car-large.png"
  }
});
```

# Error Handling

Handler functions should not throw exceptions. Ideally, you should catch errors in your handlers using try/catch and respond with an appropriate output to the user. If exceptions do leak out of handlers, they will be thrown by default. Any exceptions can be handled by a generic error handler which you can define for your app. Error handlers cannot be asynchronous.

```javascript
app.error = function(exception, request, response) {
    response.say("Sorry, something bad happened");
};
```

If you do want exceptions to bubble out to the caller (and potentially cause Express to crash, for example), you can throw the exception.

```javascript
app.error = function(exception, request, response) {
  console.log(exception);
  throw exception;
};
```

# Examples

## Asynchronous Intent Handler

If an intent handler will return a response later, it must return `false`. This tells the alexa-app library not to send the response automatically. In this case, the handler function must manually call `response.send()` to finish the response.

```javascript
app.intent("checkStatus", function(request, response) {
  http.get("http://server.com/status.html", function(rc) {
    // this is async and will run after the http call returns
    response.say(rc.statusText);
    // must call send to end the original request
    response.send();
  });
  // return false immediately so alexa-app doesn't send the response
  return false;
});
```

## Connect to AWS Lambda

Amazon has documentation on how to setup your Alexa app to run in AWS Lambda.

Apps built using alexa-app have a built-in "handler" method to handle calls from AWS Lambda. You don't need to do anything different to make them work within Lambda, other than to setup the Lambda Function correctly and make sure that the Handler is set to "index.handler", which is the default value.

For backwards compatibility, or if you wish to change the Handler mapping to something other than index.handler, you can use the lambda() function. See [example/lambda.js](example/lambda.js).

```javascript
var app = new alexa.app("sample");
app.intent( ... );
// connect the alexa-app to AWS Lambda
exports.handler = app.lambda();
```

## Connect to Express

```javascript
var express = require("express");
var alexa = require("alexa-app");
var express_app = express();

var app = new alexa.app("sample");
app.launch(function(request,response) {
  response.say("Hello World");
});

// this call defines a post() and optionally a get() handler in express, mapped to the alexa-app
// express_app: the express app instance to map to
//        path: the path prefix to map to
// enableDebug: when false, don't map a GET handler, default is true
//              debugging GET requests call express' render() method using 'test'
app.express(express_app, "/echo/", false);

// now POST calls to /echo/sample in express will be handled by the app.request() function
// GET calls will not be handled
```

## Customizing Default Error Messages

```javascript
app.messages.NO_INTENT_FOUND = "Why you called dat intent? I don't know bout dat";
```

See the code for default messages you can override.

## Read/write session data

```javascript
app.launch(function(request, response) {
  request.getSession().set("number", 42);
  response.say("Would you like to know the number?");
  response.shouldEndSession(false);
});

app.intent("tellme", function(request, response) {
  var session = request.getSession();
  response.say("The number is " + session.get("number"));
  // clear only the 'number' attribute from the session
  session.clear("number");
});

// the session variables can be entirely cleared, or cleared by key
app.intent("clear", function(request, response) {
  var session = request.getSession();
  session.clear(); // or: session.clear("key") to clear a single value
  response.say("Session cleared!");
});
```

By default, alexa-app will persist every request session attribute into the response. This way, any session attributes you set will be sent on every subsequent request, as is typical in most web programming environments. If you wish to disable this feature, you can do so by setting `app.persistentSession` to `false`.

```javascript
var app = new alexa.app("test");
app.persistentSession = false;
```

## Define a custom endpoint name for an app

When mapped to express, the default endpoint for each app is the name of the app. You can customize this using the second parameter to the `app()` method.

```javascript
var app = new alexa.app("hello", "myEndpointName");
```

## Accessing All Defined Apps

All named apps can be found in the `alexa.apps` object, keyed by name. The value is the app itself.

## Hosting

### Production

Generally, an alexa-app module can be used inside a stand-alone Node.js app, within an HTTPS server or within an AWS Lambda function. The library only cares about JSON in and JSON out. It is agnostic about the environment that is using it, but it provides some convenience methods to hook into common environments.

If you don't use AWS Lambda and host an Alexa skill on your own webserver, you will need to validate that requests come from Alexa. This validation is *not* provided by this module. For more details on how to handle alexa request validation, look at [alexa-verifier](https://github.com/mreinstein/alexa-verifier) which provides the necessary code, along with an example showing how to integrate with express.

### Development

Use the [alexa-app-server](https://github.com/matt-kruse/alexa-app-server) module in combination with alexa-app as a container for multiple alexa-app skills using Node.js and Express. It lets you run and debug your apps locally, and can also be used as a full production server for your apps.

# History

See [CHANGELOG](CHANGELOG.md) for details.

# License

Copyright (c) 2016 Matt Kruse

MIT License, see [LICENSE](LICENSE.md) for details.
