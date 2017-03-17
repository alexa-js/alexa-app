/*jshint expr: true*/
"use strict";
var chai = require("chai");
var expect = chai.expect;
chai.config.includeStack = true;

describe("Alexa", function() {
  var Alexa = require("../index");
  describe("app", function() {
    var testApp;
    beforeEach(function() {
      testApp = new Alexa.app("testApp");
    });

    describe("#utterances", function() {
      beforeEach(function() {
        testApp.intent("testIntentTwo", {
          "slots": {
            "NAME": "LITERAL",
            "AGE": "NUMBER"
          },
          "utterances": ["my {name is|name's} {names|NAME} and {I am|I'm} {1-2|AGE}{ years old|}"]
        });

        testApp.intent("testIntent", {
          "slots": {
            "AirportCode": "FAACODES",
          },
          "utterances": ["{|flight|airport} {|delays} {|for} {-|AirportCode}"]
        });
      });

      it("generates expected list of sample utterances", function() {
        var subject = testApp.utterances();
        var expected = "testIntentTwo" + " " + "my name is {names|NAME} and I am {one|AGE} years old" + "\n";
        expected += "testIntentTwo" + " " + "my name's {names|NAME} and I am {two|AGE} years old" + "\n";
        expected += "testIntentTwo" + " " + "my name is {names|NAME} and I'm {one|AGE} years old" + "\n";
        expected += "testIntentTwo" + " " + "my name's {names|NAME} and I'm {two|AGE} years old" + "\n";
        expected += "testIntentTwo" + " " + "my name is {names|NAME} and I am {one|AGE}" + "\n";
        expected += "testIntentTwo" + " " + "my name's {names|NAME} and I am {two|AGE}" + "\n";
        expected += "testIntentTwo" + " " + "my name is {names|NAME} and I'm {one|AGE}" + "\n";
        expected += "testIntentTwo" + " " + "my name's {names|NAME} and I'm {two|AGE}" + "\n";
        expected += "testIntent" + " " + "{AirportCode}" + "\n";
        expected += "testIntent" + " " + "flight {AirportCode}" + "\n";
        expected += "testIntent" + " " + "airport {AirportCode}" + "\n";
        expected += "testIntent" + " " + "delays {AirportCode}" + "\n";
        expected += "testIntent" + " " + "flight delays {AirportCode}" + "\n";
        expected += "testIntent" + " " + "airport delays {AirportCode}" + "\n";
        expected += "testIntent" + " " + "for {AirportCode}" + "\n";
        expected += "testIntent" + " " + "flight for {AirportCode}" + "\n";
        expected += "testIntent" + " " + "airport for {AirportCode}" + "\n";
        expected += "testIntent" + " " + "delays for {AirportCode}" + "\n";
        expected += "testIntent" + " " + "flight delays for {AirportCode}" + "\n";
        expected += "testIntent" + " " + "airport delays for {AirportCode}" + "\n";
        expect(subject).to.eq(expected);
      });
    });
  });
});
