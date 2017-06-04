/*jshint expr: true*/
"use strict";
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var mockHelper = require("./helpers/mock_helper");
chai.use(chaiAsPromised);
var expect = chai.expect;
chai.config.includeStack = true;

describe("Alexa", function() {
  var Alexa = require("../index");

  describe("app", function() {
    var testApp;
    beforeEach(function() {
      testApp = new Alexa.app("testApp");
    });

    describe("#request generating error", function() {
      describe("response", function() {
        var mockRequest = mockHelper.load("intent_request_airport_info.json");
        var expectedMessage = "tubular!";

        it('fails with unhandled message: error.message.', function() {
          var intentHandler = function(req, res) {
            res.say(expectedMessage);
            throw new Error("OOPS!");
          };

          testApp.intent("airportInfoIntent", {}, intentHandler);
          var subject = testApp.request(mockRequest).then(function(response) {
            return response.response.outputSpeech;
          });
          return expect(subject).to.eventually.be.rejectedWith("Unhandled exception: OOPS!.");
        });

        it('fails with unhandled message: "Unhandled exception:" message.', function() {
          var intentHandler = function(req, res) {
            res.say(expectedMessage);
            throw "OOPS!";
          };

          testApp.intent("airportInfoIntent", {}, intentHandler);
          var subject = testApp.request(mockRequest).then(function(response) {
            return response.response.outputSpeech;
          });
          return expect(subject).to.eventually.be.rejectedWith("Unhandled exception: OOPS!.");
        });

        it('fails with unhandled message: "Unhandled exception."', function() {
          var intentHandler = function(req, res) {
            res.say(expectedMessage);
            throw new Error();
          };

          testApp.intent("airportInfoIntent", {}, intentHandler);
          var subject = testApp.request(mockRequest).then(function(response) {
            return response.response.outputSpeech;
          });
          return expect(subject).to.eventually.be.rejectedWith("Unhandled exception.");
        });

        it('fails with handled message: app.messages[e].', function() {
          var intentHandler = function(req, res) {
            res.say(expectedMessage);
            throw "GENERIC_ERROR";
          };

          testApp.intent("airportInfoIntent", {}, intentHandler);
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
