/*jshint expr: true*/
"use strict";
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var mockHelper = require("./helpers/mock_helper");
chai.use(chaiAsPromised);
var expect = chai.expect;
chai.config.includeStack = true;

import * as Alexa from '..';

describe("Alexa", function() {
  describe("app", function() {
    var testApp = new Alexa.app("testApp");

    beforeEach(function() {
      testApp = new Alexa.app("testApp");
    });

    describe("#request generating error", function() {
      describe("response", function() {
        var mockRequest = mockHelper.load("intent_request_airport_info.json");
        var expectedMessage = "tubular!";

        it('fails with unhandled message: error.message.', function() {
          testApp.intent("airportInfoIntent", {}, function(req, res) {
            res.say(expectedMessage);
            throw new Error("OOPS!");
          });
          var subject = testApp.request(mockRequest).then(function(response) {
            return response.response.outputSpeech;
          });
          return expect(subject).to.eventually.be.rejectedWith("Unhandled exception: OOPS!.");
        });

        it('fails with unhandled message: "Unhandled exception:" message.', function() {
          testApp.intent("airportInfoIntent", {}, function(req, res) {
            res.say(expectedMessage);
            throw "OOPS!";
          });
          var subject = testApp.request(mockRequest).then(function(response) {
            return response.response.outputSpeech;
          });
          return expect(subject).to.eventually.be.rejectedWith("Unhandled exception: OOPS!.");
        });

        it('fails with unhandled message: "Unhandled exception."', function() {
          testApp.intent("airportInfoIntent", {}, function(req, res) {
            res.say(expectedMessage);
            throw new Error();
          });
          var subject = testApp.request(mockRequest).then(function(response) {
            return response.response.outputSpeech;
          });
          return expect(subject).to.eventually.be.rejectedWith("Unhandled exception.");
        });

        it('fails with handled message: app.messages[e].', function() {
          testApp.intent("airportInfoIntent", {}, function(req, res) {
            res.say(expectedMessage);
            throw "GENERIC_ERROR";
          });
          var subject = testApp.request(mockRequest).then(function(response) {
            return response.response.outputSpeech;
          });
          return expect(subject).to.eventually.become({
            ssml: "<speak>" + expectedMessage + " Sorry, the application encountered an error</speak>",
            type: "SSML"
          });
        });
      });
    });
  });
});
