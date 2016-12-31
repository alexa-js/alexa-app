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
    describe("#request", function() {
      var mockRequest = mockHelper.load("intent_request_airport_info.json");
      var expectedMessage = "tubular";
      context("intent handler with shouldEndSession = false", function() {
        var app = new Alexa.app("myapp");
        var reqObject;
        var intentHandler = function(req, res) {
          res.say(expectedMessage).shouldEndSession(false);
          res.session("foo", true);
          res.session("bar", {
            qaz: "woah"
          });
          reqObject = req;
          return true;
        };
        app.intent("airportInfoIntent", {}, intentHandler);

        it("reponds with expected context applicationId", function() {
          return app.request(mockRequest).then((response) => {
            expect(reqObject.context).to
              .have.deep.property("System.application.applicationId", "amzn1.echo-sdk-ams.app.000000-d0ed-0000-ad00-000000d00ebe");
          });
        });


        it("responds with a session object", function() {
          var subject = app.request(mockRequest).then(function(response) {
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
          app.intent("airportInfoIntent", {}, intentHandler);
          var subject = app.request(mockRequest).then(function(response) {
            return reqObject;
          });
          return Promise.all([
            expect(subject).to.eventually.have
            .property("applicationId", "amzn1.echo-sdk-ams.app.000000-d0ed-0000-ad00-000000d00ebe"),
            expect(subject).to.eventually.have
            .property("userId", "amzn1.account.AM3B227HF3FAM1B261HK7FFM3A2")
          ]);
        });
      });
    });

    describe("#response", function() {
      var mockRequest = mockHelper.load("intent_request_airport_info.json");
      var expectedMessage = "tubular";
      context("intent handler with shouldEndSession = false", function() {
        var app = new Alexa.app("myapp");
        var intentHandler = function(req, res) {
          res.say(expectedMessage).shouldEndSession(false);
          res.session("foo", true);
          res.session("bar", {
            qaz: "woah"
          });
          res.clearSession();
          return true;
        };
        app.intent("airportInfoIntent", {}, intentHandler);

        it("responds with an empty session object after clearing session", function() {
          var subject = app.request(mockRequest).then(function(response) {
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
      var expectedMessage = "tubular";
      context("intent handler with shouldEndSession = false", function() {
        var app = new Alexa.app("myapp");
        var intentHandler = function(req, res) {
          res.say(expectedMessage).shouldEndSession(false);
          res.session("foo", true);
          res.session("bar", {
            qaz: "woah"
          });
          res.clearSession("bar");
          return true;
        };
        app.intent("airportInfoIntent", {}, intentHandler);

        it("responds with session object missing a cleared session variable", function() {
          var subject = app.request(mockRequest).then(function(response) {
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
      var expectedMessage = "tubular";
      context("intent handler with shouldEndSession = false", function() {
        var app = new Alexa.app("myapp");
        var intentHandler = function(req, res) {
          res.say(expectedMessage).shouldEndSession(false);
          res.session("bar", {
            qaz: "woah"
          });
          res.session("foo", res.session("bar"));
          return true;
        };
        app.intent("airportInfoIntent", {}, intentHandler);

        it("responds with a copied session object", function() {
          var subject = app.request(mockRequest).then(function(response) {
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
      var expectedMessage = "tubular";
      var expectedReprompt = "totally";
      context("intent handler with shouldEndSession = false", function() {
        var app = new Alexa.app("myapp");
        var intentHandler = function(req, res) {
          res.say(expectedMessage).shouldEndSession(false, expectedReprompt);
          return true;
        };
        app.intent("airportInfoIntent", {}, intentHandler);

        it("responds reprompted message on shouldEndSession", function() {
          var subject = app.request(mockRequest).then(function(response) {
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
        var app = new Alexa.app("myapp");
        app.pre = function(req, res, type) {
          if (req.hasSession()) {
            // unreachable code, because the request doesn't have session
            req.getSession().set("foo", "bar");
          }
        };

        it("responds with an empty session object", function() {
          var subject = app.request(mockRequest).then(function(response) {
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
        var app, mockRequest;
        beforeEach(() => {
          mockRequest = mockHelper.load("audio_player_event_request.json");
          app = new Alexa.app("myapp");
          app.pre = function(req, res, type) {
            req.getSession().clear();
          };
        });

        it("session.clear() should not throw", function() {
          app.request(mockRequest).should.eventually.succeed;
        });

      });
    });

    describe("#request", function() {
      context("request without session", function() {
        var app, mockRequest, returnedAttributeValue;
        beforeEach(() => {
          returnedAttributeValue = "INITIAL TEST VALUE WHICH SHOULD BE OVERRIDDEN";
          mockRequest = mockHelper.load("audio_player_event_request.json");
          app = new Alexa.app("myapp");
          app.pre = function(req, res, type) {
            returnedAttributeValue = req.getSession().get("AttributeWhichDoesNotExist");
          };
        });

        it("session.get(key) should not throw if attribute is not present", function() {
          return app.request(mockRequest)
            .then(() => returnedAttributeValue.should.equal(undefined))
            .should.eventually.succeed;
        });

      });
    });

    describe("#request", function() {
      context("request with session", function() {
        var app, mockRequest, returnedAttributeValue;
        beforeEach(() => {
          returnedAttributeValue = "INITIAL TEST VALUE WHICH SHOULD BE OVERRIDDEN";
          mockRequest = mockHelper.load("intent_request_airport_info.json");
          app = new Alexa.app("myapp");
          app.pre = function(req, res, type) {
            returnedAttributeValue = req.getSession().get("AttributeWhichDoesNotExist");
          };
        });

        it("session.get(key) should not throw if attribute is not present", function() {
          return app.request(mockRequest)
            .then(() => returnedAttributeValue.should.equal(undefined))
            .should.eventually.succeed;
        });

      });
    });

    describe("#request", function() {
      context("request with session", function() {
        var app, mockRequest, returnedAttributeValue;
        beforeEach(() => {
          returnedAttributeValue = "INITIAL TEST VALUE WHICH SHOULD BE OVERRIDDEN";
          mockRequest = mockHelper.load("intent_request_airport_info_with_attributes.json");
          app = new Alexa.app("myapp");
          app.pre = function(req, res, type) {
            returnedAttributeValue = req.getSession().get("AttributeWhichDoesNotExist");
          };
        });

        it("session.get(key) should not throw if attribute is not present", function() {
          return app.request(mockRequest)
            .then(() => returnedAttributeValue.should.equal(undefined))
            .should.eventually.succeed;
        });

      });
    });

    describe("#request", function() {
      context("request with session", function() {
        var app, mockRequest;
        beforeEach(() => {
          mockRequest = mockHelper.load("intent_request_airport_info.json");
          app = new Alexa.app("myapp");
          app.pre = function(req, res, type) {
            req.getSession().clear();
          };
        });

        it("session.clear() should not throw", function() {
          app.request(mockRequest).should.eventually.succeed;
        });

      });
    });

    describe("#request", function() {
      context("request with session and attributes", function() {
        var app, mockRequest;
        beforeEach(() => {
          mockRequest = mockHelper.load("intent_request_airport_info_with_attributes.json");
          app = new Alexa.app("myapp");
          app.pre = function(req, res, type) {
            req.getSession().clear();
          };
        });

        it("session.clear() should not throw", function() {
          app.request(mockRequest).should.eventually.succeed;
        });

      });
    });

    describe("#request", function() {
      var mockRequest = mockHelper.load("audio_player_event_request.json");
      context("request without session", function() {
        context("trying to get session variable", function() {
          var app = new Alexa.app("myapp");
          app.pre = function(req, res, type) {
            req.getSession().get("foo");
          };
          describe("outputSpeech", function() {
            var subject = app.request(mockRequest).then(function(response) {
              return response.response.outputSpeech;
            });
            it("responds with NO_SESSION message", function() {
              return expect(subject).to.eventually.become({
                ssml: "<speak>" + app.messages.NO_SESSION + "</speak>",
                type: "SSML"
              });
            });
          });

        });

        context("trying to set session variable", function() {
          var app = new Alexa.app("myapp");
          app.pre = function(req, res, type) {
            req.getSession().set("foo", "bar");
          };
          describe("outputSpeech", function() {
            var subject = app.request(mockRequest).then(function(response) {
              return response.response.outputSpeech;
            });
            it("responds with NO_SESSION message", function() {
              return expect(subject).to.eventually.become({
                ssml: "<speak>" + app.messages.NO_SESSION + "</speak>",
                type: "SSML"
              });
            });
          });

        });
      });
    });

  });
});
