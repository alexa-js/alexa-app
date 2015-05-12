Alexa-App
=========

A Node module to simplify development of Alexa apps using Node.js

## Installation

  npm install alexa-app --save

## Usage

  var alexa = require('alexa-app');
  var app = new alexa.app('sample');
  app.intent('sample',function(request,response) {
    var number = request.slot('number');
    response.say("You asked for the number "+number);
    response.shouldEndSession(true);
  }

