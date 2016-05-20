/*jshint expr: true*/
"use strict";
var chai = require("chai");
var expect = chai.expect;
chai.config.includeStack = true;

describe("Alexa", function() {
  var Alexa = require("../index");
  describe("app", function() {
    describe("#utterances", function() {
      var app = new Alexa.app("myapp");
      app.intent("testIntentTwo", {
        "slots": {
          "NAME": "LITERAL",
          "AGE": "NUMBER"
        },
        "utterances": ["my {name is|name's} {names|NAME} and {I am|I'm} {1-2|AGE}{ years old|}"]
      });
      app.intent("testIntent", {
        "slots": {
          "AirportCode": "FAACODES",
        },
        "utterances": ["{|flight|airport} {|delays} {|for} {-|AirportCode}"]
      });
      it("generates expected list of sample utterances", function() {
        var subject = app.utterances();
        var expected = "testIntentTwo" + "\t" + "my name is {names|NAME} and I am {one|AGE} years old" + "\n";
        expected += "testIntentTwo" + "\t" + "my name's {names|NAME} and I am {two|AGE} years old" + "\n";
        expected += "testIntentTwo" + "\t" + "my name is {names|NAME} and I'm {one|AGE} years old" + "\n";
        expected += "testIntentTwo" + "\t" + "my name's {names|NAME} and I'm {two|AGE} years old" + "\n";
        expected += "testIntentTwo" + "\t" + "my name is {names|NAME} and I am {one|AGE}" + "\n";
        expected += "testIntentTwo" + "\t" + "my name's {names|NAME} and I am {two|AGE}" + "\n";
        expected += "testIntentTwo" + "\t" + "my name is {names|NAME} and I'm {one|AGE}" + "\n";
        expected += "testIntentTwo" + "\t" + "my name's {names|NAME} and I'm {two|AGE}" + "\n";
        expected += "testIntent" + "\t" + "{AirportCode}" + "\n";
        expected += "testIntent" + "\t" + "flight {AirportCode}" + "\n";
        expected += "testIntent" + "\t" + "airport {AirportCode}" + "\n";
        expected += "testIntent" + "\t" + "delays {AirportCode}" + "\n";
        expected += "testIntent" + "\t" + "flight delays {AirportCode}" + "\n";
        expected += "testIntent" + "\t" + "airport delays {AirportCode}" + "\n";
        expected += "testIntent" + "\t" + "for {AirportCode}" + "\n";
        expected += "testIntent" + "\t" + "flight for {AirportCode}" + "\n";
        expected += "testIntent" + "\t" + "airport for {AirportCode}" + "\n";
        expected += "testIntent" + "\t" + "delays for {AirportCode}" + "\n";
        expected += "testIntent" + "\t" + "flight delays for {AirportCode}" + "\n";
        expected += "testIntent" + "\t" + "airport delays for {AirportCode}" + "\n";
        expect(subject).to.eq(expected);
      });
    });
  });
});
