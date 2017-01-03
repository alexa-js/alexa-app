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
      var mockRequest = mockHelper.load("intent_request_airport_info.json");

      context("intent handler with shouldEndSession = false", function() {
        var reqObject;

        beforeEach(() => {
          var intentHandler = function(req, res) {
            res.say("message").shouldEndSession(false);
            res.session("foo", true);
            res.session("bar", {
              qaz: "woah"
            });
            reqObject = req;
            return true;
          };

          testApp.intent("airportInfoIntent", {}, intentHandler);
        });

        it("reponds with expected context applicationId", function() {
          return testApp.request(mockRequest).then((response) => {
            expect(reqObject.context).to
              .have.deep.property(
                "System.application.applicationId",
                "amzn1.echo-sdk-ams.app.000000-d0ed-0000-ad00-000000d00ebe"
              );
          });
        });


        it("responds with a session object", function() {
          var subject = testApp.request(mockRequest).then(function(response) {
            return response.sessionAttributes;
          });

          return Promise.all([
            expect(subject).to.eventually.become({
              foo: true,
              bar: {
                qaz: "woah"
              }
            })
          ]);
        });

        it("has a res object with expected properties", function() {
          var subject = testApp.request(mockRequest).then(function(response) {
            return reqObject;
          });

          return Promise.all([
            expect(subject).to.eventually.have.property(
              "applicationId",
              "amzn1.echo-sdk-ams.app.000000-d0ed-0000-ad00-000000d00ebe"
            ),
            expect(subject).to.eventually.have.property(
              "userId",
              "amzn1.account.AM3B227HF3FAM1B261HK7FFM3A2"
            )
          ]);
        });
      });
    });

    describe("#response", function() {
      var mockRequest = mockHelper.load("intent_request_airport_info.json");

      context("intent handler with shouldEndSession = false", function() {
        it("responds with an empty session object after clearing session", function() {
          var intentHandler = function(req, res) {
            res.say("hi").shouldEndSession(false);
            res.session("foo", true);
            res.session("bar", {
              qaz: "woah"
            });
            res.clearSession();
            return true;
          };

          testApp.intent("airportInfoIntent", {}, intentHandler);

          var subject = testApp.request(mockRequest).then(function(response) {
            return response.sessionAttributes;
          });
          return Promise.all([
            expect(subject).to.eventually.become({})
          ]);
        });
      });
    });

    describe("#response", function() {
      var mockRequest = mockHelper.load("intent_request_airport_info.json");

      context("intent handler with shouldEndSession = false", function() {
        it("responds with session object missing a cleared session variable", function() {
          var intentHandler = function(req, res) {
            res.say("hi").shouldEndSession(false);
            res.session("foo", true);
            res.session("bar", {
              qaz: "woah"
            });
            res.clearSession("bar");
            return true;
          };

          testApp.intent("airportInfoIntent", {}, intentHandler);

          var subject = testApp.request(mockRequest).then(function(response) {
            return response.sessionAttributes;
          });

          return Promise.all([
            expect(subject).to.eventually.become({ "foo": true })
          ]);
        });

      });
    });

    describe("#response", function() {
      var mockRequest = mockHelper.load("intent_request_airport_info.json");

      context("intent handler with shouldEndSession = false", function() {
        it("responds with a copied session object", function() {
          var intentHandler = function(req, res) {
            res.say("hi").shouldEndSession(false);
            res.session("bar", {
              qaz: "woah"
            });
            res.session("foo", res.session("bar"));
            return true;
          };

          testApp.intent("airportInfoIntent", {}, intentHandler);

          var subject = testApp.request(mockRequest).then(function(response) {
            return response.sessionAttributes["foo"];
          });

          return Promise.all([
            expect(subject).to.eventually.become({
              qaz: "woah"
            })
          ]);
        });
      });
    });

    describe("#response", function() {
      var mockRequest = mockHelper.load("intent_request_airport_info.json");
      context("intent handler with shouldEndSession = false", function() {
        it("responds reprompted message on shouldEndSession", function() {
          var expectedReprompt = "totally";

          var intentHandler = function(req, res) {
            res.say("hi").shouldEndSession(false, expectedReprompt);
            return true;
          };

          testApp.intent("airportInfoIntent", {}, intentHandler);

          var subject = testApp.request(mockRequest).then(function(response) {
            return response.response.reprompt.outputSpeech;
          });

          return expect(subject).to.eventually.become({
            ssml: "<speak>" + expectedReprompt + "</speak>",
            type: "SSML"
          });
        });
      });
    });

    describe("#request", function() {
      var mockRequest = mockHelper.load("audio_player_event_request.json");

      context("request without session", function() {
        it("responds with an empty session object", function() {
          testApp.pre = function(req, res, type) {
            if (req.hasSession()) {
              // unreachable code, because the request doesn't have session
              req.getSession().set("foo", "bar");
            }
          };

          var subject = testApp.request(mockRequest).then(function(response) {
            return response.sessionAttributes;
          });

          return Promise.all([
            expect(subject).to.eventually.become({})
          ]);
        });

      });
    });

    describe("#request", function() {
      context("request without session", function() {
        var mockRequest = mockHelper.load("audio_player_event_request.json");

        it("session.clear() should not throw", function() {
          testApp.pre = function(req, res, type) {
            req.getSession().clear();
          };

          return testApp.request(mockRequest);
        });
      });
    });

    describe("#request", function() {
      context("request without session", function() {
        var mockRequest = mockHelper.load("audio_player_event_request.json");

        it("session.get(key) should throw if attribute is not present", function() {
          var returnedAttributeValue = "overridden";

          testApp.pre = function(req, res, type) {
            returnedAttributeValue = req.getSession().get("AttributeWhichDoesNotExist");
          };

          return testApp.request(mockRequest).then(() => expect(returnedAttributeValue).to.not.be.undefined);
        });
      });
    });

    describe("#request", function() {
      context("request with session", function() {
        var mockRequest = mockHelper.load("intent_request_airport_info.json");

        it("session.get(key) should not throw if attribute is not present", function() {
          var returnedAttributeValue = "overridden";

          testApp.pre = function(req, res, type) {
            returnedAttributeValue = req.getSession().get("AttributeWhichDoesNotExist");
          };

          return testApp.request(mockRequest).then(() => expect(returnedAttributeValue).to.be.undefined);
        });
      });
    });

    describe("#request", function() {
      context("request with session", function() {
        var mockRequest = mockHelper.load("intent_request_airport_info_with_attributes.json");

        it("session.get(key) should not throw if attribute is not present", function() {
          var returnedAttributeValue = "overridden";
          var returnedAirportCode = "overridden";
          var returnedAirportCodeBackwardsCompat = "overridden";

          testApp.pre = function(req, res, type) {
            returnedAttributeValue = req.getSession().get("AttributeWhichDoesNotExist");
            returnedAirportCode = req.getSession().get("airportCode");
            returnedAirportCodeBackwardsCompat = req.session("airportCode");
          };

          return testApp.request(mockRequest)
            .then(function() {
              expect(returnedAttributeValue).to.be.undefined;
              expect(returnedAirportCode).to.equal("DAL");
              expect(returnedAirportCodeBackwardsCompat).to.equal("DAL");
            });
        });

      });
    });

    describe("#request", function() {
      context("request with session", function() {
        var mockRequest = mockHelper.load("intent_request_airport_info.json");

        it("session.clear() should not throw", function() {
          testApp.pre = function(req, res, type) {
            req.getSession().clear();
          };

          return testApp.request(mockRequest);
        });

      });
    });

    describe("#request", function() {
      context("request with session and attributes", function() {
        var mockRequest = mockHelper.load("intent_request_airport_info_with_attributes.json");

        it("session.clear() should not throw", function() {
          testApp.pre = function(req, res, type) {
            req.getSession().clear();
          };

          return testApp.request(mockRequest);
        });
      });
    });

    describe("#request", function() {
      var mockRequest = mockHelper.load("audio_player_event_request.json");

      context("request without session", function() {
        context("trying to get session variable", function() {
          describe("outputSpeech", function() {
            it("responds with NO_SESSION message", function() {
              testApp.pre = function(req, res, type) {
                req.getSession().get("foo");
              };

              var subject = testApp.request(mockRequest).then(function(response) {
                return response.response.outputSpeech;
              });

              return expect(subject).to.eventually.become({
                ssml: "<speak>" + testApp.messages.NO_SESSION + "</speak>",
                type: "SSML"
              });
            });
          });
        });

        context("trying to set session variable", function() {
          describe("outputSpeech", function() {
            it("responds with NO_SESSION message", function() {
              testApp.pre = function(req, res, type) {
                req.getSession().set("foo", "bar");
              };

              var subject = testApp.request(mockRequest).then(function(response) {
                return response.response.outputSpeech;
              });

              return expect(subject).to.eventually.become({
                ssml: "<speak>" + testApp.messages.NO_SESSION + "</speak>",
                type: "SSML"
              });
            });
          });

        });
      });
    });
  });
});
