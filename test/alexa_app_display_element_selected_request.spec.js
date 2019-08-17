/*jshint expr: true*/
"use strict";
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var mockHelper = require("./helpers/mock_helper");
chai.use(chaiAsPromised);
var expect = chai.expect;
chai.config.includeStack = true;

import * as Alexa from '..'

describe("Alexa", function() {
  describe("app", function() {
    var testApp = new Alexa.app("testApp");

    beforeEach(function() {
      testApp = new Alexa.app("testApp");
    });

    describe("#request", function() {
      describe("response", function() {
        var mockRequest = mockHelper.load("display_element_selected_request.json");

        context("with a request of Display.ElementSelected", function() {
          context("with no displayElementSelected handler", function() {
            describe("outputSpeech", function() {
              it("responds with NO_DISPLAY_ELEMENT_SELECTED message", function() {
                var subject = testApp.request(mockRequest).then(function(response) {
                  return response.response.outputSpeech;
                });

                return expect(subject).to.eventually.become({
                  ssml: "<speak>" + testApp.messages.NO_DISPLAY_ELEMENT_SELECTED_FUNCTION + "</speak>",
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
                testApp.displayElementSelected(function(req, res) {
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
                testApp.displayElementSelected(function(req, res) {
                  res.say(expectedMessage)
                    .reprompt(expectedReprompt)
                    .reprompt(expectedReprompt);
                });

                var subject = testApp.request(mockRequest).then(function(response) {
                  return response.response.reprompt.outputSpeech;
                });

                return expect(subject).to.eventually.become({
                  ssml: "<speak>" + expectedReprompt + " " + expectedReprompt + "</speak>",
                  type: "SSML"
                });
              });

              it("combines says into a larger response", function() {
                testApp.displayElementSelected(function(req, res) {
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
                testApp.displayElementSelected(function(req, res) {
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
                testApp.displayElementSelected(function(req, res) {
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

              it("handles error for promise", function() {
                testApp.displayElementSelected(function(req, res) {
                  return Promise.reject(new Error("promise failure"));
                });

                var subject = testApp.request(mockRequest);

                return expect(subject).to.be.rejectedWith("promise failure");
              });
            });

            describe("requestToken", function() {
              it("handles reprompting correctly", function() {
                testApp.displayElementSelected(function(req, res) {
                  expect(req.selectedElementToken).to.equal(mockRequest.request.token)
                  expect(req.context.Display.token).to.equal(mockRequest.context.Display.token)
                  res.say(expectedMessage).say(expectedMessage).reprompt(expectedReprompt);
                });

                var subject = testApp.request(mockRequest).then(function(response) {
                  return response.response.outputSpeech;
                });
              });
            })
          });
        });
      });
    });
  });
});
