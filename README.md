# alexa-app

A Node module to simplify development of Alexa apps (Skills) using Node.js

Generation of sample utterances from the schema definition in alexa-app has been pulled out to the separate *[alexa-utterances](https://github.com/mreinstein/alexa-utterances)* module.

# Installation

```bash
	npm install alexa-app --save
```

# alexa-app-server Container

The *[alexa-app-server](https://github.com/matt-kruse/alexa-app-server/)* module is a fully-working container for multiple alexa-app skills using Node.js and Express. It lets you run and debug your apps locally, and can also be used as a full production server for your apps.

# Summary

alexa-app does the dirty work of interpretting the JSON request from Amazon and building the JSON response. It provides convenience methods to more easily build the response, handle session objects, and add cards. It also makes it easy to run multiple endpoints (apps) on one Node.js server instance.

After defining your application's behavior, your caller (Express, Lambda, etc) should call the app.request() method, and pass the Alexa JSON request object. It will return a promise containing the response JSON. Your caller should then insert that into its response, whatever form it may take (see examples below).

The intent schema definition and sample utterances can be included in your application's definition, making it very simple to generate hundreds (or thousands!) of sample utterances with a few lines.

NOTE: alexa-app makes no assumptions about what context it is running in. It will run in a stand-alone Node.js app, within an HTTPS server, within an AWS Lambda function, etc. It only cares about JSON in and JSON out. It is agnostic about the environment that is using it, but it provides some convenience methods to hook into common environments.

# Features

- Simplified handling of requests and generating responses
- Asynchronous handlers supported
- Easy connection into AWS Lambda or Node.js express (and can be connected to any other server)
- Auto-generation of intent schema and sample utterances
- Easier handling of session data
- Apps can be tested without running a server

# Example Usage

See the *example* directory for sample implementations.

```javascript
var alexa = require('alexa-app');
var app = new alexa.app('sample');

app.intent('number',
  {
    "slots":{"number":"NUMBER"}
	,"utterances":[ "say the number {1-100|number}" ]
  },
  function(request,response) {
    var number = request.slot('number');
    response.say("You asked for the number "+number);
  }
);

// Manually hook the handler function into express
express.post('/sample',function(req,res) {
  app.request(req.body)        // connect express to alexa-app
    .then(function(response) { // alexa-app returns a promise with the response
      res.json(response);      // stream it to express' output
    });
});
```

# API

Apps ("skills") define handlers for launch, intent, and session end, just like normal Alexa development. The alexa-app module provides a layer around this functionality that simplifies the interaction. Each handler gets passed a request and response object, which are custom objects for this module.

## request

```javascript
// Return the type of request received (LaunchRequest, IntentRequest, SessionEndedRequest)
String request.type()

// Return the value passed in for a given slot name
String request.slot('slotName')

// Return the value of a session variable
String request.session('attributeName')

// Session details, as passed by Amazon in the request
request.sessionDetails = { ... }

// The raw request JSON object
request.data
```

## response

The response JSON object is automatically built for you. All you need to do is tell it what you want to output.

```javascript
// Tell Alexa to say something. Multiple calls to say() will be appended to each other.
// All text output is treated as SSML
response.say(String phrase)

// Empty the response text
response.clear()

// Tell Alexa to re-prompt the user for a response, if it didn't hear anything valid
response.reprompt(String phrase)

// Return a card to the user's Echo app
response.card(String title, String content [, String subtitle] )

// Return a card instructing the user how to link their account to the skill.
// This internally sets the card response.
response.linkAccount()

// Tell Alexa whether the user's session is over. By default, sessions end.
// You can optionally pass a reprompt message
response.shouldEndSession(boolean end [, String reprompt] )

// Set a session variable
// By defailt, Alexa only persists session variables to the next request. The alexa-app module 
// makes session variables persist across multiple requests.
response.session(String attributeName, String attributeValue)

// Send the response as success
// You don't usually need to call this. This is only required if your handler is 
// asynchronous - for example, if it makes an http request and needs to wait for
// the response, then send it back to Alexa when finished.
response.send()

// Trigger a response failure
// The internal promise containing the response will be rejected, and should be handled by
// the calling environment. Instead of the Alexa response being returned, the failure
// message will be passed.
response.fail(String message)

// Calls to response can be chained together
response.say("OK").send();
```

# Request Handlers

Your app can define a single handler for the Launch event and the SessionEnded event, and multiple Intent handlers.

## LaunchRequest

```javascript
app.launch(function(request,response) {
  response.say("Hello World");
  response.card("Hello World","This is an example card");
});
```

## IntentRequest

Define the handler for multiple intents using multiple calls to intent(). Intent schema and sample utterances can also be passed to intent(), which is detailed below. Intent handlers that don't return an immediate response (because they do some asynchronous operation) must return false. See example further below.

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
    // Clean up the user's server-side stuff, if necessary
	logout( request.userId );
	// No response necessary
});
```

# Execute Code On Every Request

In addition to specific event handlers, you can define functions that will run on every request. 

## pre()

Executed before any event handlers. This is useful to setup new sessions, validate the applicationId, or do any other kind of validations.

```javascript
app.pre = function(request,response,type) {
	if (request.sessionDetails.application.applicationId!="amzn1.echo-sdk-ams.app.000000-d0ed-0000-ad00-000000d00ebe") {
		// Fail ungracefully
		response.fail("Invalid applicationId");
	}
};
```

Note: The post() method still gets called, even if the pre() function calls send() or fail(). The post method can always override anything done before it.

## post()

The last thing executed for every request. It is even called if there is an exception or if a response has already been sent. The post() function can change anything about the response. It can even turn a response.fail() into a respond.send() with entirely new content. If post() is called after an exception is thrown, the exception itself will be the last argument.

```javascript
app.post = function(request,response,type,exception) {
	// Always turn an exception into a successful response
	response.clear().say("An error occured: "+exception).send();
};
```

# Schema and Utterances

alexa-app makes it easy to define your intent schema and generate many sample utterances. Optionally pass your schema definition along with your intent handler, and extract the generated content using the schema() and utterances() functions on your app.

## Schema Syntax

Pass an object with two properties: slots and utterances.

```javascript
app.intent('sampleIntent',
	{
		"slots":{"NAME":"LITERAL","AGE":"NUMBER"}, 
		"utterances":[ "my {name is|name's} {names|NAME} and {I am|I'm} {1-100|AGE}{ years old|}" ]
	},
	function(request,response) { ... }
);
```

### slots

The slots object is a simple Name:Type mapping. The type must be one of Amazon's supported slot types: LITERAL, NUMBER, DATE, TIME, DURATION

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

This lets you define multiple ways to say a phrase, but combined into a single sample utterance

```javascript
"{what is the|what's the|check the} status"
=>
"what is the status"
"what's the status"
"check the status"
```

#### Auto-Generated Number Ranges

When capturing a numeric slot value, it's helpful to generate many sample utterances with different number values

```javascript
"buy {2-5|NUMBER} items"
=>
"buy {two|NUMBER} items"
"buy {three|NUMBER} items"
"buy {four|NUMBER} items"
"buy {five|NUMBER} items"
```

Number ranges can also increment in steps

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

To get the generated content out of your app, call the schema() and utterances() functions. See examples/express.js for one way to output this data.

```javascript
// Returns a String representation of the JSON object
app.schema() =>

{
  "intents": [
    {
      "intent": "MyColorIsIntent",
      "slots": [
        {
          "name": "Color",
          "type": "LITERAL"
        }
      ]
    }
  ]
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

If an intent handler will return a response later, it must return false. This tells the alexa-app library not to send the response automatically. In this case, the handler function must manually call response.send() to finish the response.

```javascript
app.intent('checkStatus', function(request,response) {
    http.get("http://server.com/status.html", function(res) {
        // This is async and will run after the http call returns
	    response.say(res.statusText);
        // Must call send to end the original request
        response.send();
    });
    // Return false immediately so alexa-app doesn't send the response
    return false;
});
```

## Connect to AWS Lambda

Amazon has documentation on how to setup your Alexa app to run in AWS Lambda. 

Apps built using alexa-app have a built-in "handler" method to handle calls from AWS Lambda. You don't need to do anything different to make them work within Lambda, other than to setup the Lambda Function correctly and make sure that the Handler is set to "index.handler", which is the default value.

For backwards compatibility, or if you wish to change the Handler mapping to something other than index.handler, you can use the lambda() function. See example/lambda.js.

```javascript
var app = new alexa.app('sample');
app.intent( ... );
// Connect the alexa-app to AWS Lambda
exports.handler = app.lambda();
```

## Connect to Express

```javascript
var express = require('express');
var alexa = require('alexa-app');
var bodyParser = require('body-parser');

var express_app = express();

var app = new alexa.app('sample');
app.launch(function(request,response) {
	response.say("Hello World");
});

// This call defines a post() and optionally a get() handler in express, mapped to the alexa-app
// express_app: The express app instance to map to
// path: The path prefix to map to
// enableDebug: If false, don't mapy a GET handler. Default: true
//    Debugging GET requests call express' render() method using 'test'
app.express( express_app, "/echo/", false );

// Now POST calls to /echo/sample in express will be handled by the app.request() function.
// GET calls will not be handled

```

## Customizing Default Error Messages

```javascript
app.messages.NO_INTENT_FOUND = "Why you called dat intent? I don't know bout dat";
```

See the code for default messages you can override.

## Read/write session data

```javascript
app.launch(function(request,response) {
	response.session('number',42);
	response.say("Would you like to know the number?");
	response.shouldEndSession(false);
});
app.intent('tellme', function(request,response) {
	response.say("The number is "+request.session('number'));
	// Clear only the 'number' attribute from the session
	response.clearSesssion('number');
});
// The session variables can be entirely cleared, or cleared by key
app.intent('clear', function(request,response) {
	response.clearSession(); // or: response.clearSession('key') to clear a single value
	response.say("Session cleared!");
});
```

By default, alexa-app will persist every request session attribute into the response. This way, any session attributes you set will be sent on every subsequent request, as is typical in most web programming environments. If you wish to disable this feature, you can do so.

```javascript
var app = new alexa.app('test');
app.persistentSession = false;
```

## Define a custom endpoint name for an app

When mapped to express, the default endpoint for each app is the name of the app. You can customize this using the second parameter to the app() method.

```javascript
var app = new alexa.app('hello','myEndpointName');
```

## Accessing All Defined Apps

All named apps can be found in the alexa.apps object, keyed by name. The value is the app itself.

## History

- 2.3.2 - Jan 11, 2016
  - Fixed number output in SSML tags back to being digits
  - Added automated tests for SSML

- 2.3.0 - Jan 8, 2016
  - Added "numbered" to the depencies list in package.json

- 2.3.0 - Jan 4, 2016
  - Added support for SSML
  - Added .linkAccount() method to return Link Account card
  - Added request.sessionDetails.accessToken for skills using account linking
  - Added MIT license file

- 2.2.0 - Oct 26, 2015
  - Bumped alexa-utterances to version 0.1.0
  - Added support for the "exhaustiveUtterances" option in alexa-utterances (Issue #27)
  - By default, alexa-app utterances now avoid the cartesian product of all slot values

- 2.1.5 - Oct 25, 2015
  - Externalized the generation of utterances to the new alexa-utterances module (Issue #26)
  
- 2.1.4 - Sep 14, 2015
  - Remove hyphen from generated numbers in utterances (Issue #17)
  - Collapse multiple whitespaces to one space in utterances (Issue #18)

