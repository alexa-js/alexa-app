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

    describe("#request", function() {
      describe("response", function() {
        var mockRequest = mockHelper.load("intent_request_on.json");

        context("with a request of type GameEngine.InputHandlerEvent", function() {
          context("with no type handler", function() {
            describe("outputSpeech", function() {
              it("responds with INVALID_REQUEST_TYPE message", function() {
                var subject = testApp.request(mockRequest).then(function(response) {
                  return response.response.outputSpeech;
                });

                return expect(subject).to.eventually.become({
                  ssml: "<speak>" + testApp.messages.INVALID_REQUEST_TYPE + "</speak>",
                  type: "SSML"
                });
              });
            });
          });

          context("with a matching type handler", function() {
            var expectedMessage = "Valid Response";
            testApp.on('GameEngine.InputHandlerEvent', function(req, res) {
              res.say(expectedMessage);
            });
            describe("outputSpeech", function() {
              it("responds with expected message", function() {
                testApp.on('GameEngine.InputHandlerEvent', function(req, res) {
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

              it("responds with expected message for promise", function() {
                testApp.on('GameEngine.InputHandlerEvent', function(req, res) {
                  return Promise.resolve().then(function() {
                    res.say(expectedMessage);
                  });
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
