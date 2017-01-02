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
    var app = new Alexa.app("myapp");
    describe("#request", function() {
      describe("response", function() {
        var mockRequest = mockHelper.load("intent_request_airport_info.json");
        describe("defaults", function() {
          var subject = app.request(mockRequest);
          it("responds with expected version attribute", function() {
            return expect(subject).to.eventually.have.property("version", "1.0");
          });
          describe("alexa response", function() {
            it("responds with expected alexa response defaults", function() {
              subject = subject.then(function(response) {
                return response.response;
              });
              return expect(subject).to.eventually.have.property("shouldEndSession", true);
            });
          });
        });
        context("with an intent request of airportInfoIntent", function() {
          context("with no intent handler", function() {
            var app = new Alexa.app("myapp");
            var subject = app.request(mockRequest);
            describe("outputSpeech", function() {
              subject = subject.then(function(response) {
                return response.response.outputSpeech;
              });
              it("responds with NO_INTENT_FOUND message", function() {
                return expect(subject).to.eventually.become({
                  ssml: "<speak>" + app.messages.NO_INTENT_FOUND + "</speak>",
                  type: "SSML"
                });
              });
            });
          });

          context("with a matching intent handler", function() {
            var app = new Alexa.app("myapp");
            var intentHandler = function(req, res) {
              res.say(expectedMessage);
              return true;
            };
            var expectedMessage = "tubular!";
            app.intent("airportInfoIntent", {}, intentHandler);

            describe("outputSpeech", function() {
              context("with a post method", function() {
                it("invokes the post method after the intenthandler", function() {
                  var postMessage = "hallelujah";
                  app = new Alexa.app("myapp");
                  app.post = function(req, res, type) {
                    res.say(postMessage);
                  };
                  app.intent("airportInfoIntent", {},
                    function(req, res) {
                      res.say("foobar");
                      return true;
                    });
                  var subject = app.request(mockRequest).then(function(response) {
                    return response.response.outputSpeech;
                  });
                  return expect(subject).to.eventually.become({
                    ssml: "<speak>foobar hallelujah</speak>",
                    type: "SSML"
                  });
                });
              });

              context("with a pre method", function() {
                it("invokes the pre method before intenthandler", function() {
                  var preMessage = "hallelujah";
                  app = new Alexa.app("myapp");
                  app.pre = function(req, res, type) {
                    res.say(preMessage);
                  };
                  app.intent("airportInfoIntent", {},
                    function(req, res) {
                      res.say("foobar");
                      return true;
                    });
                  var subject = app.request(mockRequest).then(function(response) {
                    return response.response.outputSpeech;
                  });
                  return expect(subject).to.eventually.become({
                    ssml: "<speak>hallelujah foobar</speak>",
                    type: "SSML"
                  });
                });
              });

              it("clears output when clear is called", function() {
                app = new Alexa.app("myapp");
                intentHandler = function(req, res) {
                  res.say(expectedMessage).say(expectedMessage).clear();
                  return true;
                };
                app.intent("airportInfoIntent", {}, intentHandler);
                var subject = app.request(mockRequest);
                subject = subject.then(function(response) {
                  return response.response.outputSpeech;
                });
                return expect(subject).to.eventually.become({
                  ssml: "<speak></speak>",
                  type: "SSML"
                });
              });

              it("clears output when clear is called and say is then called", function() {
                app = new Alexa.app("myapp");
                intentHandler = function(req, res) {
                  res.say(expectedMessage)
                    .say(expectedMessage)
                    .clear().say(expectedMessage);
                  return true;
                };
                app.intent("airportInfoIntent", {}, intentHandler);
                var subject = app.request(mockRequest);
                subject = subject.then(function(response) {
                  return response.response.outputSpeech;
                });
                return expect(subject).to.eventually.become({
                  ssml: "<speak>tubular!</speak>",
                  type: "SSML"
                });
              });

              it("combines says into a larger response", function() {
                app = new Alexa.app("myapp");
                intentHandler = function(req, res) {
                  res.say(expectedMessage).say(expectedMessage);
                  return true;
                };
                app.intent("airportInfoIntent", {}, intentHandler);
                var subject = app.request(mockRequest);
                subject = subject.then(function(response) {
                  return response.response.outputSpeech;
                });
                return expect(subject).to.eventually.become({
                  ssml: "<speak>" + expectedMessage + " " + expectedMessage + "</speak>",
                  type: "SSML"
                });
              });

              it("responds with expected message", function() {
                app = new Alexa.app("myapp");
                intentHandler = function(req, res) {
                  res.say(expectedMessage);
                  return true;
                };
                app.intent("airportInfoIntent", {}, intentHandler);
                var subject = app.request(mockRequest);
                subject = subject.then(function(response) {
                  return response.response.outputSpeech;
                });
                return expect(subject).to.eventually.become({
                  ssml: "<speak>" + expectedMessage + "</speak>",
                  type: "SSML"
                });
              });

              it("retrieves a slot value", function() {
                app = new Alexa.app("myapp");
                app.intent("airportInfoIntent", {}, function(req, res) {
                  res.say(req.slot("AirportCode"));
                  return true;
                });
                var subject = app.request(mockRequest);
                subject = subject.then(function(response) {
                  return response.response.outputSpeech;
                });
                return expect(subject).to.eventually.become({
                  ssml: "<speak>JFK</speak>",
                  type: "SSML"
                });
              });

              it("retrieves default slot value", function() {
                app = new Alexa.app("myapp");
                app.intent("airportInfoIntent", {}, function(req, res) {
                  res.say(req.slot("InvalidSlotName", "default value"));
                  return true;
                });
                var subject = app.request(mockRequest);
                subject = subject.then(function(response) {
                  return response.response.outputSpeech;
                });
                return expect(subject).to.eventually.become({
                  ssml: "<speak>default value</speak>",
                  type: "SSML"
                });
              });

              context("when fail is called", function() {
                it("fails ungracefully", function() {
                  app = new Alexa.app("myapp");
                  app.intent("airportInfoIntent", {},
                    function(req, res) {
                      res.fail("whoops");
                      return true;
                    });
                  var subject = app.request(mockRequest);
                  return expect(subject).to.be.rejectedWith("whoops");
                });

                it("can clear failure in post", function() {
                  app = new Alexa.app("myapp");
                  app.post = function(req, res, type) {
                    res.clear().say("An error occured!").send();
                  };
                  app.intent("airportInfoIntent", {},
                    function(req, res) {
                      res.fail("whoops");
                      return true;
                    });
                  var subject = app.request(mockRequest).then(function(response) {
                    return response.response.outputSpeech;
                  });
                  return expect(subject).to.eventually.become({
                    ssml: "<speak>An error occured!</speak>",
                    type: "SSML"
                  });
                });
              });

              context("when an exception occurs", function() {
                it("reports failure", function() {
                  app = new Alexa.app("myapp");
                  app.intent("airportInfoIntent", {},
                    function(req, res) {
                      throw new Error("whoops");
                    });
                  var subject = app.request(mockRequest);
                  return expect(subject).to.be.rejectedWith("Unhandled exception: whoops.");
                });
              });
            });
          });
        });
      });
    });
  });
});
