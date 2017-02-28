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
    describe("unknown type #request", function() {
      describe("response", function() {

        var mockRequest = mockHelper.load("unknown_type_request.json");

        var testApp;
        beforeEach(function() {
          testApp = new Alexa.app("testApp");
        });

        it("invokes a globally defined error function that throws an error", function() {
          testApp.error = function(e, request, response) {
            throw "foobar";
          };

          var subject = testApp.request(mockRequest).then(function(response) {
              return response.response;
          });
          return expect(subject).to.eventually.be.rejectedWith("foobar");
        });

        it("swallows uncaught errors without a message in the globally defined error function", function() {
          testApp.error = function(e, request, response) {
            // don't handle
          };

          var subject = testApp.request(mockRequest).then(function(response) {
            return response.response;
          });
          return expect(subject).to.eventually.become({
            directives: [],
            shouldEndSession: true
          });
        });

        it("responds with a spoken message for uncaught errors in the globally defined error function", function() {
          testApp.error = function(e, request, response) {
            response.say("Sorry, something bad happened");
          };

          var subject = testApp.request(mockRequest).then(function(response) {
            return response.response.outputSpeech;
          });
          return expect(subject).to.eventually.become({
            ssml: "<speak>Sorry, something bad happened</speak>",
            type: "SSML"
          });
        });

        it("responds with a spoken message for uncaught errors in the globally defined error function and resolves", function() {
          testApp.error = function(e, request, response) {
            response.say("Sorry, something bad happened");
            return response.send();
          };

          var subject = testApp.request(mockRequest).then(function(response) {
            return response.response.outputSpeech;
          });
          return expect(subject).to.eventually.become({
            ssml: "<speak>Sorry, something bad happened</speak>",
            type: "SSML"
          });
        });

        it("responds with a spoken message for uncaught errors in the globally defined error function and fails", function() {
          testApp.error = function(e, request, response) {
            response.say("Sorry, something bad happened");
            return response.fail(e);
          };

          var subject = testApp.request(mockRequest).then(function(response) {
            return response.response.outputSpeech;
          });
          return expect(subject).to.eventually.be.rejectedWith("INVALID_REQUEST_TYPE");
        });

        it("fails with not a valid request", function() {
          var subject = testApp.request(mockRequest).then(function(response) {
            return response.response.outputSpeech;
          });

          return expect(subject).to.eventually.become({
            ssml: "<speak>Error: not a valid request</speak>",
            type: "SSML"
          });
        });
      });
    });
  });
});
