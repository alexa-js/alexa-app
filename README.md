## Table of Contents

* [Stable Release](#stable-release)
* [Introduction](#introduction)
* [Features](#features)
* [Examples](#examples)
    * [AWS Lambda](#aws-lambda)
    * [Express](#express)
      * [Heroku Quickstart](#heroku-quickstart)
* [API](#api)
    * [request](#request)
    * [response](#response)
      * [Building SSML Responses](#building-ssml-responses)
    * [session](#session)
    * [slot](#slot)
    * [slotResolution](#slotResolution)
    * [resolutionValue](#resolutionValue)
* [Request Handlers](#request-handlers)
    * [LaunchRequest](#launchrequest)
    * [IntentRequest](#intentrequest)
    * [SessionEndRequest](#sessionendrequest)
    * [Display.ElementSelected](#display-element-selected)
    * [AudioPlayer Event Request](#audioplayer-event-request)
    * [PlaybackController Event Request](#playbackcontroller-event-request)
    * [Other Event Request](#other-event-request)
* [Execute Code On Every Request](#execute-code-on-every-request)
    * [pre()](#pre)
    * [post()](#post)
* [Schema and Utterances](#schema-and-utterances)
    * [Schema Syntax](#schema-syntax)
        * [slots](#slots)
        * [custom slot types](#custom-slot-types)
        * [utterances](#utterances)
            * [Using a Dictionary](#using-a-dictionary)
    * [Generating Schema and Utterances Output](#generating-schema-and-utterances-output)
* [Cards](#cards)
    * [Card Examples](#card-examples)
* [Custom Directives](#custom-directives)
* [Dialog](#dialog)
* [Error Handling](#error-handling)
* [Echo Show Support](#echo-show-support)
* [Asynchronous Handlers Example](#asynchronous-handlers-example)
    * [Customizing Default Error Messages](#customizing-default-error-messages)
    * [Read/write session data](#readwrite-session-data)
    * [Define a custom endpoint name for an app](#define-a-custom-endpoint-name-for-an-app)
* [License](#license)

# alexa-app

A Node module to simplify the development of Alexa skills (applications.)

[![NPM](https://img.shields.io/npm/v/alexa-app.svg)](https://www.npmjs.com/package/alexa-app/)
[![Build Status](https://travis-ci.org/alexa-js/alexa-app.svg?branch=master)](https://travis-ci.org/alexa-js/alexa-app)
[![Coverage Status](https://coveralls.io/repos/github/alexa-js/alexa-app/badge.svg?branch=master)](https://coveralls.io/github/alexa-js/alexa-app?branch=master)

## Stable Release

You're reading the documentation for the stable release of alexa-app, 4.2.2. Please see [CHANGELOG](CHANGELOG.md) and make sure to read [UPGRADING](UPGRADING.md) when upgrading from a previous version.

## Introduction

This module parses HTTP JSON requests from the Alexa platform and builds the JSON response that consumed by an Alexa-compatible device, such as the Echo.

It provides a DSL for defining intents, convenience methods to more easily build the response, handle session objects, and add cards.

The intent schema definition and sample utterances are included in your application's definition, making it very simple to generate hundreds (or thousands!) of sample utterances with a few lines.

This module provides a way to host a standalone web service for an Alexa skill. If you're looking for a full-fledged application server
or the ability to host multiple skills, check out [alexa-app-server](https://github.com/alexa-js/alexa-app-server).

## Features

- simplified handling of requests and generating responses
- support for asynchronous handlers
- easy connection into AWS Lambda or Node.js Express, etc.
- auto-generation of intent schema and sample utterances
- support for session data
- comprehensive test suite
- TypeScript type definitions for type validation, IDE autocompletion, etc

## Examples

### AWS Lambda

Amazon skills that use alexa-app have a built-in `handler` method to handle calls from AWS Lambda.
You need to make sure that the Handler is set to `index.handler`, which is the default value.

```javascript
var alexa = require("alexa-app");
var app = new alexa.app("sample");

app.intent("number", {
    "slots": { "number": "AMAZON.NUMBER" },
    "utterances": ["say the number {-|number}"]
  },
  function(request, response) {
    var number = request.slot("number");
    response.say("You asked for the number " + number);
  }
);

// connect the alexa-app to AWS Lambda
exports.handler = app.lambda();
```

For backwards compatibility, or if you wish to change the Handler mapping to something other than index.handler, you can use the lambda() function.

A full lambda example is available [here](example/lambda.js).

### Express

```javascript
var express = require("express");
var alexa = require("alexa-app");
var express_app = express();

var app = new alexa.app("sample");

app.intent("number", {
    "slots": { "number": "AMAZON.NUMBER" },
    "utterances": ["say the number {-|number}"]
  },
  function(request, response) {
    var number = request.slot("number");
    response.say("You asked for the number " + number);
  }
);

// setup the alexa app and attach it to express before anything else
app.express({ expressApp: express_app });

// now POST calls to /sample in express will be handled by the app.request() function
// GET calls will not be handled

// from here on, you can setup any other express routes or middleware as normal
```

The express function accepts the following parameters.

* `expressApp` the express app instance to attach to
* `router` the express router instance to attach to
* `endpoint` the path to attach the express app or router to (e.g., passing `'mine'` attaches to `/mine`)
* `checkCert` when true, applies Alexa certificate checking _(default: true)_
* `debug` when true, sets up the route to handle GET requests _(default: false)_
* `preRequest` function to execute before every POST
* `postRequest` function to execute after every POST

Either `expressApp` or `router` is required.

A full express example is available [here](example/express.js).

#### Heroku Quickstart

Want to get started quickly with alexa-app and Heroku? Simply click the button below!

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/alexa-js/alexa-app-example)

## API

Skills define handlers for launch, intent, and session end, just like normal Alexa development. The alexa-app module provides a layer around this functionality that simplifies the interaction. Each handler gets passed a request and response object, which are custom for this module.

### request

```javascript
// return the type of request received (LaunchRequest, IntentRequest, SessionEndedRequest)
String request.type()

// return the value passed in for a given slot name
String request.slot("slotName")

// return the Slot object
Slot request.slots["slotName"]

// return the intent's confirmationStatus
String request.confirmationStatus

// check if the intent is confirmed
Boolean request.isConfirmed()

// return the Dialog object
Dialog request.getDialog()

// check if you can use session (read or write)
Boolean request.hasSession()

// return the session object
Session request.getSession()

// return the request context
request.context

// the raw request JSON object
request.data
```

### response

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

// stop playing audio stream (send AudioPlayer.Stop directive)
response.audioPlayerStop()

// clear audio player queue (send AudioPlayer.ClearQueue directive)
// clearBehavior is "CLEAR_ALL" by default
response.audioPlayerClearQueue([ String clearBehavior ])

// tell Alexa whether the user's session is over; sessions end by default
// pass null or undefined to leave shouldEndSession undefined in the response, to satisfy newer API's
// you can optionally pass a reprompt message
response.shouldEndSession(boolean end [, String reprompt] )

// send the response to the Alexa device (success) immediately
// this returns a promise that you must return to continue the
// promise chain. Calling this is optional in most cases as it
// will be called automatically when the handler promise chain
// resolves, but you can call it and return its value in the
// chain to send the response immediately. You can also use it
// to send a response from `post` after failure.
async response.send()

// trigger a response failure
// the internal promise containing the response will be rejected, and should be handled by the calling environment
// instead of the Alexa response being returned, the failure message will be passed
// similar to `response.send()`, you must return the value returned from this call to continue the promise chain
// this is equivalent to calling `throw message` in handlers
// *NOTE:* this does not generate a response compatible with Alexa, so when calling it explicitly you may want to handle the response with `.error` or `.post`
async response.fail(String message)

// calls to response can be chained together
return response.say("OK").send()
```

#### Building SSML Responses

Use [ssml-builder](https://github.com/mandnyc/ssml-builder) to build SSML responses.

Example using basic SSML tags:
```javascript
var Speech = require('ssml-builder');

var speech = new Speech()
  .say('Hello')
  .pause('1s')
  .say('fellow Alexa developers')
  .pause('500ms')
  .say('Testing phone numbers')
  .sayAs({
    word: "+1-234-567-8900",
    interpret: "telephone"
  });

// change 'true' to 'false' if you want to include the surrounding <speak/> tag
var speechOutput = speech.ssml(true);
response.say(speechOutput);
```

Example using Amazon SSML specific tags:
```javascript
var AmazonSpeech = require('ssml-builder/amazon_speech');

var speech = new AmazonSpeech()
  .say('Hello')
  .pause('1s')
  .whisper('I can see you when you are sleeping')
  .pause('500ms')
  .say('Is your phone number still')
  .sayAs({
    word: "+1-234-567-8900",
    interpret: "telephone"
  });

var speechOutput = speech.ssml();
response.say(speechOutput);
```

### session
```javascript
// check if you can use session (read or write)
Boolean request.hasSession()

// get the session object
var session = request.getSession()

// set a session variable
// by defailt, Alexa only persists session variables to the next request
// the alexa-app module makes session variables persist across multiple requests
// Note that you *must* use `.set` or `.clear` to update
// session properties. Updating properties of `attributeValue`
// that are objects will not persist until `.set` is called
session.set(String attributeName, String attributeValue)

// return the value of a session variable
String session.get(String attributeName)

// session details, as passed by Amazon in the request
// for Object definition @see https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#session-object
session.details = { ... }
```

### slot
```javascript
// get the slot object
var slot = request.slots["slotName"]

// return the slot's name
String slot.name

// return the slot's value
String slot.value

// return the slot's confirmationStatus
String slot.confirmationStatus

// return the slot's resolutions
SlotResolution[] slot.resolutions

// check if the slot is confirmed
Boolean slot.isConfirmed()

// return the n-th resolution
SlotResolution slot.resolution(Integer n)
```

### slotResolution
```javascript
// get the resolution status code
String resolution.status

// get the list of resolution values
ResolutionValue resolution.values

// check if the resolution is matched
Boolean resolution.isMatched()

// Get the first resolution value
ResolutionValue resolution.first()
```

### resolutionValue
```javascript
// get the value name
String resolutionValue.name

// get the value id
String resolutionValue.id
```

## Request Handlers

Your app can define a single handler for the `Launch` event and the `SessionEnded` event, and multiple intent handlers.

### LaunchRequest

```javascript
app.launch(function(request, response) {
  response.say("Hello World");
  response.card("Hello World", "This is an example card");
});
```

### IntentRequest

Define the handler for multiple intents using multiple calls to `intent()`.
Additional Intent configuration schema like slots and sample utterances can also be passed to `intent()`, which is detailed below.
Intent handlers that don't return an immediate response (because they do some asynchronous operation) must return a Promise. The response will be sent when the promise is resolved and fail when the promise is rejected.
See example further below.

```javascript
app.intent("live", {
    "dialog": {
      type: "delegate",
    },
    "slots": {
      "city": "AMAZON.US_CITY"
    },
    "utterances": [
      "in {-|city}"
    ]
  },
  function(request, response) {
    response.say("You live in " + request.slot("city"));
  }
);

app.intent("vacation", function(request, response) {
  response.say("You're now on vacation.");
});
```

#### AMAZON Specific Intents

Amazon has specific intents that have to do with basic functionality of your skill that you must add.  Some examples of this are `AMAZON.HelpIntent`, `AMAZON.StopIntent`, and `AMAZON.CancelIntent`.  Here are examples of how you would specify these types of intents.

```javascript
app.intent("AMAZON.HelpIntent", {
    "slots": {},
    "utterances": []
  },
  function(request, response) {
    var helpOutput = "You can say 'some statement' or ask 'some question'. You can also say stop or exit to quit.";
    var reprompt = "What would you like to do?";
    // AMAZON.HelpIntent must leave session open -> .shouldEndSession(false)
    response.say(helpOutput).reprompt(reprompt).shouldEndSession(false);
  }
);

app.intent("AMAZON.StopIntent", {
    "slots": {},
    "utterances": []
  }, function(request, response) {
    var stopOutput = "Don't You Worry. I'll be back.";
    response.say(stopOutput);
  }
);

app.intent("AMAZON.CancelIntent", {
    "slots": {},
    "utterances": []
  }, function(request, response) {
    var cancelOutput = "No problem. Request cancelled.";
    response.say(cancelOutput);
  }
);
```

You do not need to pass any utterances or slots into these intents.  Also when specifying the name of the intent just use the exact name Amazon [provides](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/built-in-intent-ref/standard-intents).

### Display Element Selected

Define the handler for when a user selects an element displayed on alexa touch enabled device. For instance the [Echo Show](https://www.amazon.com/Amazon-MW46WB-Introducing-Echo-Show/dp/B01J24C0TI).

```javascript
app.displayElementSelected(function(request, response) {
  // The request object selectedElementToken will be populated with the token that was registered
  // the element in the display directive. To get the token associated with the directive itself,
  // it is populated on the request.context.Display.token property.
  handleRequestForTouchEvent(request.selectedElementToken)
})
```

### SessionEndRequest

```javascript
app.sessionEnded(function(request, response) {
  // cleanup the user's server-side session
  logout(request.userId);
  // no response required
});
```

### AudioPlayer Event Request

Define the handler for multiple events using multiple calls to `audioPlayer()`. You can define only one handler per event. Event handlers that don't return an immediate response (because they do some asynchronous operation) must return a Promise.

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
  return getNextSongFromDBAsync()
  .then(function(url, token) {
    var stream = {
      "url": url,
      "token": token,
      "expectedPreviousToken": "some_previous_token",
      "offsetInMilliseconds": 0
    };
    response.audioPlayerPlayStream("ENQUEUE", stream);
  });
});
```

### PlaybackController Event Request

PlaybackController events are sent to your skill when the user interacts with player controls on a device. Define multiple handlers for various events by making multiple calls to `playbackController` with each event type.

You can define handlers for the following events:

* PlayCommandIssued
* PauseCommandIssued
* NextCommandIssued
* PreviousCommandIssued

Read more about PlaybackController requests in the [PlaybackController Interface Reference](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-playbackcontroller-interface-reference).

The following example will send a play directive to the device when a user presses the "next" button.

```javascript
app.playbackController('NextCommandIssued', (request, response) => {
  var stream = {
    "url": "https://next-song-url",
    "token": "some_token",
    "expectedPreviousToken": "some_previous_token",
    "offsetInMilliseconds": 0
  };
  response.audioPlayerPlayStream("REPLACE_ALL", stream);
});
```

Note that some device interactions don't always produce PlaybackController events. See the [PlaybackController Interface Introduction](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-playbackcontroller-interface-reference#introduction) for more details.

### Other Event Request

Handle any new requests that don't have an explicit handler type available (such as new or pre-release features) using the general `on()` and passing the event type.

The following example will handle an imaginary request of type `DeviceEngine.InputHandler` as if it were added to the Alexa API.

```javascript
app.on('DeviceEngine.InputHandler', (request, response, request_json) => {
  response.say("You triggered an event from device " + request_json.request.event.deviceName);
});
```

Note that the raw request json is sent as the 3rd parameter to make sure the handler function has access to all data in the case that the request format differs from other handler types.

## Execute Code On Every Request

In addition to specific event handlers, you can define functions that will run on every request.

### pre()

Executed before any event handlers. This is useful to setup new sessions, validate the `applicationId`, or do any other kind of validations.
You can perform asynchronous functionality in `pre` by returning a Promise.

```javascript
app.pre = function(request, response, type) {
  if (request.applicationId != "amzn1.echo-sdk-ams.app.000000-d0ed-0000-ad00-000000d00ebe") {
    // fail ungracefully
    throw "Invalid applicationId";
    // `return response.fail("Invalid applicationId")` will also work
  }
};

// Asynchronous
app.pre = function(request, response, type) {
  return db.getApplicationId().then(function(appId) {
    if (request.applicationId != appId) {
      throw new Error("Invalid applicationId");
    }
  });
};
```

Note that the `post()` method still gets called, even if the `pre()` function calls `send()` or `fail()`. The post method can always override anything done before it.

### post()

The last thing executed for every request. It is even called if there is an exception or if a response has already been sent. The `post()` function can change anything about the response. It can even turn a `return response.fail()` into a `return respond.send()` with entirely new content. If `post()` is called after an exception is thrown, the exception itself will be the 4th argument.

You can perform asynchronous functionality in `pre` by returning a Promise similar to `pre` or any of the handlers.

```javascript
app.post = function(request, response, type, exception) {
  if (exception) {
    // always turn an exception into a successful response
    return response.clear().say("An error occured: " + exception).send();
  }
};
```

## Schema and Utterances

The alexa-app module makes it easy to define your intent schema and generate many sample utterances. Optionally pass your schema definition along with your intent handler, and extract the generated content using either the `schemas.intent()` and `utterances()` functions on your app (if using the normal Developer portal), `schemas.skillBuilder()` if using the new Skill Builder beta, or `schemas.askcli()` if using the `ask-cli` tool.


### Schema Syntax

Pass an object with two properties: slots and utterances.

```javascript
app.intent("sampleIntent", {
    "slots": {
      "NAME": "AMAZON.US_FIRST_NAME",
      "AGE": "AMAZON.NUMBER"
    },
    "utterances": [
      "my {name is|name's} {NAME} and {I am|I'm} {-|AGE}{ years old|}"
    ]
  },
  function(request, response) { ... }
);
```

#### slots

The slots object is a simple `name: type` mapping. The type must be one of Amazon's [built-in slot types](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/built-in-intent-ref/slot-type-reference), such as `AMAZON.DATE` or `AMAZON.NUMBER`.

#### custom slot types

[Custom slot types](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interaction-model-reference#custom-slot-syntax) are supported via the following syntax.

```javascript
app.intent("sampleIntent", {
    "slots": {
      "CustomSlotName": "CustomSlotType"
    },
    "utterances": [
      "airport {information|status} for {-|CustomSlotName}"
    ]
  },
  function(request, response) { ... }
);
```

This will result in the following utterance list.

```
sampleIntent     airport information for {CustomSlotName}
sampleIntent     airport status for {CustomSlotName}
```

Note that the "CustomSlotType" type values must be specified in the Skill Interface's Interaction Model for the custom slot type to function correctly.

#### custom slot type values

If you have custom slot types, you can define your custom slot type values as well. Custom values can either be simple strings, or more full-fledged objects if you want to take advantage of Skill Builder features like synonyms.

```javascript
testApp.customSlot("animal", ["cat", "dog"]);
```

OR

```javascript
testApp.customSlot("animal", [{
  value: "dog",
  id: "canine",
  synonyms: ["doggo", "pupper", "woofmeister"]
}]);
```

#### utterances

The utterances syntax allows you to generate many (hundreds or even thousands) of sample utterances using just a few samples that get auto-expanded.
Any number of sample utterances may be passed in the utterances array.

This module internally uses [alexa-utterances](https://github.com/alexa-js/alexa-utterances)
to expand these convenient strings into a format that alexa understands. Read the documentation there for a
thorough set of examples on how to use this.

##### Using a Dictionary

Several intents may use the same list of possible values, so you want to define them in one place, not in each intent schema. Use the app's dictionary.

```javascript
app.dictionary = {"colors":["red","green","blue"]};
...
"my favorite color is {colors|FAVEORITE_COLOR}"
"I like {colors|COLOR}"
```

### Generating Schema and Utterances Output

#### Intent Schema Syntax

If you are using the normal Amazon developer portal, the `schemas.intent()` and `utterances()` functions will generate an
intent schema JSON string and a list of utterances, respectively.

See [example/express.js](example/express.js) for one way to output this data.

```javascript
// returns a String representation of an Intent Schema JSON object
app.schemas.intent() =>

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

#### Skill Builder Syntax

If you are using the Skill Builder Beta, the `schemas.skillBuilder()` function will generate a single schema JSON string
that includes your intents with all of their utterances

```javascript
app.schemas.skillBuilder() =>

{
  "intents": [{
    "name": "MyColorIsIntent",
    "samples": [
      "my color is {dark brown|Color}",
      "my color is {green|Color}",
      "my favorite color is {red|Color}",
      "my favorite color is {navy blue|Color}"
    ],
    "slots": [{
      "name": "Color",
      "type": "AMAZON.Color",
      "samples": []
    }]
  }],
  "types": [{
    "name": "MyCustomColor",
    "values": [{
      "id": null,
      "name": {
        "value": "aquamarine",
        "synonyms": ["aqua", "seafoam", "teal"]
      }
    }]
  }];
}
```

#### ask-cli Schema

The [ask-cli](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/ask-cli-intro) tool accepts a schema in the same format as the Skill Builder, but is structured slightly differently. The `schemas.askcli()` function generates a JSON string suitable to be used with the `ask deploy` command.

This schema format requires you to specify the invocation name for your skill. You can set this for your skill by setting `app.invocationName`. If you need to use different invocation names for the same skill (e.g. you have both a staging and production version), the schema function itself can take in an invocation name which overwrites the app's default.

```javascript
app.schemas.askcli("favorite color") =>

{
  "interactionModel": {
    "languageModel": {
      "invocationName": "favorite color"
      "intents": [{
        "name": "MyColorIsIntent",
        "samples": [
          "my color is {dark brown|Color}",
          "my color is {green|Color}",
          "my favorite color is {red|Color}",
          "my favorite color is {navy blue|Color}"
        ],
        "slots": [{
          "name": "Color",
          "type": "AMAZON.Color",
          "samples": []
        }]
      }],
      "types": [{
        "name": "MyCustomColor",
        "values": [{
          "id": null,
          "name": {
            "value": "aquamarine",
            "synonyms": ["aqua", "seafoam", "teal"]
          }
        }]
      }];
    }
  }
}
```

## Cards

The `response.card(Object card)` method allows you to send [Home Cards](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/providing-home-cards-for-the-amazon-alexa-app) on the Alexa app, the companion app available for Fire OS, Android, iOS, and desktop web browsers.

The full specification for the `card` object passed to this method can be found [here](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#card-object).

The full specification for the permission card can be found [here](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/device-address-api#sample-response-with-permission-card).

Cards do not support SSML.

If you just want to display a card that presents the user to link their account call `response.linkAccount()` as a shortcut.

### Card Examples

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

Display a card that presents the user to grant information to your skill, aka [AskForPermissionsConsent](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/device-address-api#sample-response-with-permission-card).

If the request was for the country and postal code, then the permissions value in this response will be `read::alexa:device:all:address:country_and_postal_code`.

```javascript
response.card({
  type: "AskForPermissionsConsent",
  permissions: [ "read::alexa:device:all:address" ] // full address
});
```

## Custom Directives

The `response.directive(Object directive)` method allows you to set custom directive objects to devices to perform a specific device-level actions.

The full specification for the `directive` object passed to this method can be found [here](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#response-format).

The `alexa-app` library has special handling for AudioPlayer directives, so you only need to use this method for more general custom directives.

The `response.directive` adds your directive object to the directives array in the response. To clear the directives from the response, call `response.getDirectives().clear()`.

## Dialog

The full specification for the dialog directives that can be used can be found [here](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/dialog-interface-reference). See [Custom Directives](#custom-directives) above for an example on manually sending dialog directives.

Note that skills must meet Alexa's [requirements to use the `Dialog` directive](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/dialog-interface-reference#dialog-reqs).

The `alexa-app` library has special handling for enabling Alexa to handle Dialog directly. To
configure `alexa-app` to delegate dialog to Alexa, enable the handling
per-intent via the schema:

```javascript
app.intent("sampleIntent", {
    "dialog": {
      type: "delegate"
    },
    "slots": { ... },
    "utterances": [ ... ],
  },
  function(request, response) { ... }
);
```

### dialog object

```javascript
// return the Dialog object
Dialog request.getDialog()

// return the intent's dialogState
String request.dialogState

// check if the intent's dialog is STARTED
Boolean dialog.isStarted()

// check if the intent's dialog is IN_PROGRESS
Boolean dialog.isInProgress()

// check if the intent's dialog is COMPLETED
Boolean dialog.isCompleted()
```

## Error Handling

When handler functions throw exceptions, they will trigger a rejection in the promise chain. If the response has not already been sent, `.post` will be triggered which will allow you to force a successful response. If `post` does not alter the response, then a failed response will be sent. You can use this to throw an exception to or call `return response.fail("message")` to force a failure, but this *does not* generate a response compatible with Alexa.

The `.error` handler method will capture any errors in the chain. The default behavior of `.error` is to trigger `response.send` if the response has not already been sent, but you can force or continue failure by returning a rejected promise or `throw`ing inside the error handler. Returning a promise allows you to do asynchronous operations in the error handler.

Ideally, you should catch errors in your handlers and respond with an appropriate output to the user. Any exceptions can be handled by a generic error handler which you can define for your app. If you want error handling to be asynchronous, it must return a promise.

```javascript
app.error = function(exception, request, response) {
  response.say("Sorry, something bad happened");
};
```

If you do want exceptions to bubble out to the caller (and potentially cause Express to crash, for example), you can throw the exception from the error handler.

```javascript
app.error = function(exception, request, response) {
  console.error(exception);
  throw exception;
};
```

## Echo Show Support

With the addition of [custom directives](#custom-directives) and support for [display elements]((#display-element-selected)) being selected, this library fully supports the Echo Show. Note that it is up to the developer to detect if the device can handle a display directive. If a display directive is returned to a non-visual device it will throw an error. One technique is to leverage the `app.post` call and remove any directives if the device does not support a UI. For example:

```
app.post(req, res, type, exception) {
  // If the device does not support display directives then remove them from the response
  if (!system.supportsDisplay(req))) {
    res.response.response.directives = []
  }
}
```

Please refer to [Amazon's documentation](https://developer.amazon.com/docs/custom-skills/display-interface-reference.html#display-template-reference) for the list of supported template markup.

## Asynchronous Handlers Example

If an intent or other request handler (including `pre` and `post`, but *not* `error`) will return a response later, it must a `Promise`. This tells the alexa-app library not to send the response automatically.

If the Promise resolves, the response will be sent. If it is rejected, it is treated as an error.

```javascript
app.intent("checkStatus", function(request, response) {
  // `getAsync` returns a Promise in this example. When
  // returning a Promise, the response is sent after it
  // resolves. If rejected, it is treated as an error.
  return http.getAsync("http://server.com/status.html").then(function (rc) {
    response.say(rc.statusText);
  });
});
```

If you want to respond immediately, you can use `return response.send()` to complete the respones. Using `throw msg` or `return response.fail(msg)` will trigger immediate failure. **Note:** `.post` is still run once after `response.send()` or `response.fail()` are called.

```javascript
app.intent("checkStatus", function(request, response) {
  if (currentStatus == "bad") {
    return response.fail("bad status");
  }
  else if (currentStatus == "good") {
    response.say("good status");
    return response.send();
  }

  return http.getAsync("http://server.com/status.html").then(function (rc) {
    if (rc.body == "bad") {
      throw "bad status";
    }
    response.say("good status");
    // return `response.send` to continue the promise chain
    return response.send();
  });
});
```

### Customizing Default Error Messages

```javascript
app.messages.NO_INTENT_FOUND = "Why you called dat intent? I don't know bout dat";
```

See the code for default messages you can override.

### Read/write session data

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

### Define a custom endpoint name for an app

When mapped to express, the default endpoint for each app is the name of the app. You can customize this using the second parameter to the `app()` method.

```javascript
var app = new alexa.app("hello", "myEndpointName");
```

All named apps can be found in the `alexa.apps` object, keyed by name. The value is the app itself.

## License

Copyright (c) 2016-2017 Matt Kruse

MIT License, see [LICENSE](LICENSE.md) for details.
