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
    beforeEach(() => {
      testApp = new Alexa.app("testApp");
    });

    describe("#request", function() {
      describe("response", function() {
        var mockRequest = mockHelper.load("intent_request_launch.json");

        context("with an intent request of launchIntent", function() {
          context("with no launch handler", function() {
            describe("outputSpeech", function() {
              it("responds with NO_LAUNCH_FUNCTION message", function() {
                var subject = testApp.request(mockRequest).then(function(response) {
                  return response.response.outputSpeech;
                });

                return expect(subject).to.eventually.become({
                  ssml: "<speak>" + testApp.messages.NO_LAUNCH_FUNCTION + "</speak>",
                  type: "SSML"
                });
              });
            });
          });

          context("with a matching intent handler", function() {
            var expectedMessage = "tubular!";
            var expectedReprompt = "sweet reprompt dude!";
            describe("outputSpeech", function() {

              it("handles reprompting correctly", function() {
                testApp.launch(function(req, res) {
                  res.say(expectedMessage).say(expectedMessage).reprompt(expectedReprompt);
                });

                var subject = testApp.request(mockRequest).then(function(response) {
                  return response.response.outputSpeech;
                });

                return expect(subject).to.eventually.become({
                  ssml: "<speak>" + expectedMessage + " " + expectedMessage + "</speak>",
                  type: "SSML"
                });
              });

              it("combines multiple reprompts?", function() {
                testApp.launch(function(req, res) {
                  res.say(expectedMessage)
                    .reprompt(expectedReprompt)
                    .reprompt(expectedReprompt);
                });

                var subject = testApp.request(mockRequest).then(function(response) {
                  return response.response.reprompt.outputSpeech;
                });

                return expect(subject).to.eventually.become({
                  ssml: "<speak>" + expectedReprompt + "</speak>",
                  type: "SSML"
                });
              });

              it("combines says into a larger response", function() {
                testApp.launch(function(req, res) {
                  res.say(expectedMessage).say(expectedMessage);
                });

                var subject = testApp.request(mockRequest).then(function(response) {
                  return response.response.outputSpeech;
                });

                return expect(subject).to.eventually.become({
                  ssml: "<speak>" + expectedMessage + " " + expectedMessage + "</speak>",
                  type: "SSML"
                });
              });

              it("responds with expected message", function() {
                testApp.launch(function(req, res) {
                  res.say(expectedMessage);
                });

                var subject = testApp.request(mockRequest).then(function(response) {
                  return response.response.outputSpeech;
                });

                return expect(subject).to.eventually.become({
                  ssml: "<speak>" + expectedMessage + "</speak>",
                  type: "SSML"
                });
              });
            });
          });
        });
      });
    });
  });
});
