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
        var mockRequest = mockHelper.load("intent_request_airport_info.json");

        describe("defaults", function() {
          var request = testApp.request(mockRequest);

          beforeEach(function() {
            request = testApp.request(mockRequest);
          })

          it("responds with expected version attribute", function() {
            return expect(request).to.eventually.have.property("version", "1.0");
          });

          describe("alexa response", function() {
            it("responds with expected alexa response defaults", function() {
              var subject = request.then(function(response) {
                return response.response;
              });
              return expect(subject).to.eventually.have.property("shouldEndSession", true);
            });
          });
        });

        context("with an intent request of airportInfoIntent", function() {
          context("with no intent handler", function() {
            var request = testApp.request(mockRequest);

            beforeEach(function() {
              request = testApp.request(mockRequest);
            })

            describe("outputSpeech", function() {
              it("responds with NO_INTENT_FOUND message", function() {
                var subject = request.then(function(response) {
                  return response.response.outputSpeech;
                });

                return expect(subject).to.eventually.become({
                  ssml: "<speak>" + testApp.messages.NO_INTENT_FOUND + "</speak>",
                  type: "SSML"
                });
              });
            });
          });

          context("with a matching intent handler", function() {
            var expectedMessage = "tubular!";

            beforeEach(function() {
              testApp.pre = undefined;
              testApp.post = undefined;
              testApp.intent("airportInfoIntent", {}, function(req, res) {
                res.say(expectedMessage);
                return true;
              });
            });

            describe("outputSpeech", function() {
              context("with a post method", function() {
                it("invokes the post method after the intenthandler", function() {
                  var postMessage = "hallelujah";

                  /**
                   * @param {Alexa.request} req
                   * @param {Alexa.response} res
                   * @param {string} type
                   */
                  testApp.post = function(req, res, type) {
                    res.say(postMessage);
                  };

                  testApp.intent("airportInfoIntent", {},
                    function(req, res) {
                      res.say("foobar");
                      return true;
                    });

                  var subject = testApp.request(mockRequest).then(function(response) {
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

                  /**
                   * @param {Alexa.request} req
                   * @param {Alexa.response} res
                   * @param {string} type
                   */
                  testApp.pre = function(req, res, type) {
                    res.say(preMessage);
                  };

                  testApp.intent("airportInfoIntent", {},
                    function(req, res) {
                      res.say("foobar");
                      return true;
                    });

                  var subject = testApp.request(mockRequest).then(function(response) {
                    return response.response.outputSpeech;
                  });

                  return expect(subject).to.eventually.become({
                    ssml: "<speak>hallelujah foobar</speak>",
                    type: "SSML"
                  });
                });

                it("allows pre function to resolve wihout going through the intent handler", function() {
                  var preMessage = "resolved!!";

                  /**
                   * @param {Alexa.request} req
                   * @param {Alexa.response} res
                   * @param {string} type
                   */
                  testApp.pre = function(req, res, type) {
                    res.say(preMessage);
                    res.resolved = true;
                  };

                  testApp.intent("airportInfoIntent", {},
                    function(req, res) {
                      res.say("foobar");
                      return true;
                    });

                  var subject = testApp.request(mockRequest).then(function(response) {
                    return response.response.outputSpeech;
                  });

                  return expect(subject).to.eventually.become({
                    ssml: "<speak>" + preMessage + "</speak>",
                    type: "SSML"
                  });
                })
              });

              it("clears output when clear is called", function() {
                testApp.intent("airportInfoIntent", {}, function(req, res) {
                  res.say(expectedMessage).say(expectedMessage).clear();
                  return true;
                });

                var request = testApp.request(mockRequest);
                var subject = request.then(function(response) {
                  return response.response.outputSpeech;
                });

                return expect(subject).to.eventually.become({
                  ssml: "<speak></speak>",
                  type: "SSML"
                });
              });

              it("clears output when clear is called and say is then called", function() {
                testApp.intent("airportInfoIntent", {}, function(req, res) {
                  res.say(expectedMessage)
                    .say(expectedMessage)
                    .clear().say(expectedMessage);
                  return true;
                });

                var request = testApp.request(mockRequest);
                var subject = request.then(function(response) {
                  return response.response.outputSpeech;
                });

                return expect(subject).to.eventually.become({
                  ssml: "<speak>tubular!</speak>",
                  type: "SSML"
                });
              });

              it("combines says into a larger response", function() {
                testApp.intent("airportInfoIntent", {}, function(req, res) {
                  res.say(expectedMessage).say(expectedMessage);
                  return true;
                });
                var request = testApp.request(mockRequest);
                var subject = request.then(function(response) {
                  return response.response.outputSpeech;
                });

                return expect(subject).to.eventually.become({
                  ssml: "<speak>" + expectedMessage + " " + expectedMessage + "</speak>",
                  type: "SSML"
                });
              });

              it("responds with expected message", function() {
                testApp.intent("airportInfoIntent", {}, function(req, res) {
                  res.say(expectedMessage);
                  return true;
                });

                var request = testApp.request(mockRequest);
                var subject = request.then(function(response) {
                  return response.response.outputSpeech;
                });

                return expect(subject).to.eventually.become({
                  ssml: "<speak>" + expectedMessage + "</speak>",
                  type: "SSML"
                });
              });

              it("responds with expected message for promise", function() {
                testApp.intent("airportInfoIntent", {}, function(req, res) {
                  return Promise.resolve().then(function() {
                    res.say(expectedMessage);
                  });
                });

                var request = testApp.request(mockRequest);
                var subject = request.then(function(response) {
                  return response.response.outputSpeech;
                });

                return expect(subject).to.eventually.become({
                  ssml: "<speak>" + expectedMessage + "</speak>",
                  type: "SSML"
                });
              });

              it("retrieves an intent confirmation status", function() {
                testApp.intent("airportInfoIntent", {}, function(req, res) {
                  res.say(req.confirmationStatus);
                  return true;
                });

                var request = testApp.request(mockRequest);
                var subject = request.then(function(response) {
                  return response.response.outputSpeech;
                });

                return expect(subject).to.eventually.become({
                  ssml: "<speak>NONE</speak>",
                  type: "SSML"
                });
              });

              context("when an intent's confirmationStatus is CONFIRMED", function() {
                var mockRequest = mockHelper.load("intent_request_airport_info.json");
                mockRequest.request.intent.confirmationStatus = "CONFIRMED";

                it("reports confirmation", function() {
                  testApp.intent("airportInfoIntent", {}, function(req, res) {
                    res.say(req.isConfirmed() ? "yes" : "no");
                    return true;
                  });

                  var request = testApp.request(mockRequest);
                  var subject = request.then(function(response) {
                    return response.response.outputSpeech;
                  });

                  return expect(subject).to.eventually.become({
                    ssml: "<speak>yes</speak>",
                    type: "SSML"
                  });
                });
              });

              context("when an intent's confirmationStatus is not CONFIRMED", function() {
                it("reports no confirmation", function() {
                  testApp.intent("airportInfoIntent", {}, function(req, res) {
                    res.say(req.isConfirmed() ? "yes" : "no");
                    return true;
                  });

                  var request = testApp.request(mockRequest);
                  var subject = request.then(function(response) {
                    return response.response.outputSpeech;
                  });

                  return expect(subject).to.eventually.become({
                    ssml: "<speak>no</speak>",
                    type: "SSML"
                  });
                });
              });

              it("retrieves a slot value", function() {
                testApp.intent("airportInfoIntent", {}, function(req, res) {
                  res.say(req.slot("AirportCode"));
                  return true;
                });

                var request = testApp.request(mockRequest);
                var subject = request.then(function(response) {
                  return response.response.outputSpeech;
                });

                return expect(subject).to.eventually.become({
                  ssml: "<speak>JFK</speak>",
                  type: "SSML"
                });
              });

              it("retrieves a slot confirmation status", function() {
                testApp.intent("airportInfoIntent", {}, function(req, res) {
                  res.say(req.slots["AirportCode"].confirmationStatus);
                  return true;
                });

                var request = testApp.request(mockRequest);
                var subject = request.then(function(response) {
                  return response.response.outputSpeech;
                });

                return expect(subject).to.eventually.become({
                  ssml: "<speak>NONE</speak>",
                  type: "SSML"
                });
              });

              context("when a slot's confirmationStatus is CONFIRMED", function() {
                var mockRequest = mockHelper.load("intent_request_airport_info.json");
                mockRequest.request.intent.slots['AirportCode'].confirmationStatus = "CONFIRMED";

                it("reports confirmation", function() {
                  testApp.intent("airportInfoIntent", {}, function(req, res) {
                    res.say(req.slots["AirportCode"].isConfirmed() ? "yes" : "no");
                    return true;
                  });

                  var request = testApp.request(mockRequest);
                  var subject = request.then(function(response) {
                    return response.response.outputSpeech;
                  });

                  return expect(subject).to.eventually.become({
                    ssml: "<speak>yes</speak>",
                    type: "SSML"
                  });
                });

                it("can handle no resolutions", function() {
                  testApp.intent("airportInfoIntent", {}, function(req, res) {
                    res.say(req.slots["AirportCode"].resolution() ? "has any" : "empty");
                    return true;
                  });

                  var request = testApp.request(mockRequest);
                  var subject = request.then(function(response) {
                    return response.response.outputSpeech;
                  });

                  return expect(subject).to.eventually.become({
                    ssml: "<speak>empty</speak>",
                    type: "SSML"
                  });
                });
              });

              context("when a slot's confirmationStatus is not CONFIRMED", function() {
                var mockRequest = mockHelper.load("intent_request_airport_info.json");
                mockRequest.request.intent.slots['AirportCode'].confirmationStatus = "NONE";

                it("reports no confirmation", function() {
                  testApp.intent("airportInfoIntent", {}, function(req, res) {
                    res.say(req.slots["AirportCode"].isConfirmed() ? "yes" : "no");
                    return true;
                  });

                  var request = testApp.request(mockRequest);
                  var subject = request.then(function(response) {
                    return response.response.outputSpeech;
                  });

                  return expect(subject).to.eventually.become({
                    ssml: "<speak>no</speak>",
                    type: "SSML"
                  });
                });
              });

              context("when a slot has matched resolutions", function() {
                var mockRequest = mockHelper.load("intent_request_airport_info_resolutions.json");

                it("reports matched resolution", function() {
                  testApp.intent("airportInfoIntent", {}, function(req, res) {
                    res.say(req.slots['AirportCode'].resolution().isMatched() ? "yes" : "no");
                    return true;
                  });

                  var request = testApp.request(mockRequest);
                  var subject = request.then(function(response) {
                    return response.response.outputSpeech;
                  });

                  return expect(subject).to.eventually.become({
                    ssml: "<speak>yes</speak>",
                    type: "SSML"
                  });
                });

                it("has a name for the resolution value", function() {
                  testApp.intent("airportInfoIntent", {}, function(req, res) {
                    res.say(req.slots['AirportCode'].resolution().first().name);
                    return true;
                  });

                  var request = testApp.request(mockRequest);
                  var subject = request.then(function(response) {
                    return response.response.outputSpeech;
                  });

                  return expect(subject).to.eventually.become({
                    ssml: "<speak>JFK</speak>",
                    type: "SSML"
                  });
                });

                it("has an id for the resolution value", function() {
                  testApp.intent("airportInfoIntent", {}, function(req, res) {
                    res.say(req.slots['AirportCode'].resolution(0).first().id);
                    return true;
                  });

                  var request = testApp.request(mockRequest);
                  var subject = request.then(function(response) {
                    return response.response.outputSpeech;
                  });

                  return expect(subject).to.eventually.become({
                    ssml: "<speak>200</speak>",
                    type: "SSML"
                  });
                });

                it("fallbacks to first resolution if index doesn't exist", function() {
                  testApp.intent("airportInfoIntent", {}, function(req, res) {
                    res.say(req.slots['AirportCode'].resolution(200).first().id);
                    return true;
                  });

                  var request = testApp.request(mockRequest);
                  var subject = request.then(function(response) {
                    return response.response.outputSpeech;
                  });

                  return expect(subject).to.eventually.become({
                    ssml: "<speak>200</speak>",
                    type: "SSML"
                  });
                });
              });

              context("when a slot has non-matched resolutions", function() {
                var mockRequest = mockHelper.load("intent_request_airport_info_resolutions_not_found.json");

                it("reports non-matched resolution", function() {
                  testApp.intent("airportInfoIntent", {}, function(req, res) {
                    res.say(req.slots['AirportCode'].resolution().isMatched() ? "yes" : "no");
                    return true;
                  });

                  var request = testApp.request(mockRequest);
                  var subject = request.then(function(response) {
                    return response.response.outputSpeech;
                  });

                  return expect(subject).to.eventually.become({
                    ssml: "<speak>no</speak>",
                    type: "SSML"
                  });
                });

                it("has no values for the resolution", function() {
                  testApp.intent("airportInfoIntent", {}, function(req, res) {
                    var resolution = req.slots['AirportCode'].resolution();
                    res.say(resolution.first() ? "has value!" : "doesn't have any values");
                    return true;
                  });

                  var request = testApp.request(mockRequest);
                  var subject = request.then(function(response) {
                    return response.response.outputSpeech;
                  });

                  return expect(subject).to.eventually.become({
                    ssml: "<speak>doesn't have any values</speak>",
                    type: "SSML"
                  });
                });
              });

              it("retrieves default slot value", function() {
                testApp.intent("airportInfoIntent", {}, function(req, res) {
                  res.say(req.slot("InvalidSlotName", "default value"));
                  return true;
                });

                var request = testApp.request(mockRequest);
                var subject = request.then(function(response) {
                  return response.response.outputSpeech;
                });

                return expect(subject).to.eventually.become({
                  ssml: "<speak>default value</speak>",
                  type: "SSML"
                });
              });

              context("when fail is called", function() {
                it("fails ungracefully", function() {
                  testApp.intent("airportInfoIntent", {},
                    function(req, res) {
                      return res.fail("whoops");
                    });

                  return testApp.request(mockRequest).should.be.rejectedWith("whoops");
                });

                it("can clear failure in post", function() {
                  /**
                   * @param {Alexa.request} req
                   * @param {Alexa.response} res
                   * @param {string} type
                   */
                  testApp.post = function(req, res, type) {
                    return res.clear().say("An error occured!").send();
                  };

                  testApp.intent("airportInfoIntent", {},
                    function(req, res) {
                      return res.fail("whoops");
                    });

                  var subject = testApp.request(mockRequest).then(function(response) {
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
                  testApp.intent("airportInfoIntent", {},
                    function(req, res) {
                      throw new Error("whoops");
                    });

                  var subject = testApp.request(mockRequest);
                  return expect(subject).to.be.rejectedWith("Unhandled exception: whoops.");
                });
              });

              context("when a response promise is rejected", function() {
                it("reports failure", function() {
                  testApp.intent("airportInfoIntent", {},
                    function(req, res) {
                      return Promise.reject(new Error("whoops"));
                    });

                  var subject = testApp.request(mockRequest);
                  return expect(subject).to.be.rejectedWith("Unhandled exception: whoops.");
                });
              });
            });
          });

          context("with a manipulated intent request", function() {
            it("retrieves default slot value due to missing intent", function() {
              testApp.intent("airportInfoIntent", {}, function(req, res) {
                delete req.data.request.intent; // remove intent from request
                res.say(req.slot("InvalidSlotName", "default value"));
                return true;
              });

              var request = testApp.request(mockRequest);
              var subject = request.then(function(response) {
                return response.response.outputSpeech;
              });

              return expect(subject).to.eventually.become({
                ssml: "<speak>default value</speak>",
                type: "SSML"
              });
            });
          });
        });
      });
    });
  });
});
