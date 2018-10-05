/*jshint expr: true*/
"use strict";
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var mockHelper = require("./helpers/mock_helper");
chai.use(chaiAsPromised);
var expect = chai.expect;
chai.config.includeStack = true;

import * as Alexa from "..";

describe("Alexa", function() {
  describe("app", function() {
    var testApp = new Alexa.app("testApp");

    beforeEach(function() {
      testApp = new Alexa.app("testApp");
    });

    describe("#request", function() {
      var mockRequest = mockHelper.load("intent_request_airport_info.json");

      context("intent handler with shouldEndSession = false", function() {
        /** @type {Alexa.request} */
        var reqObject;

        beforeEach(function() {
          testApp.intent("airportInfoIntent", {}, function(req, res) {
            res.say("message").shouldEndSession(false);
            res.session("foo", true);
            res.session("bar", {
              qaz: "woah"
            });
            reqObject = req;
            return true;
          });
        });

        it("reponds with expected context applicationId", function() {
          return testApp.request(mockRequest).then(function(response) {
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

        it("does not update session properties without explicit set", function() {
          /**
           * @param {Alexa.request} req
           * @param {Alexa.response} res
           * @param {string} type
           */
          testApp.pre = function(req, res, type) {
            var session = req.getSession();
            session.set("foo", true);
            session.set("bar", {
              qaz: "woah"
            });
          };

          testApp.intent("airportInfoIntent", {}, function(req, res) {
            var session = req.getSession();
            session.set("foo", true);
            session.set("bar", {
              qaz: "woah"
            });

            res.say("message").shouldEndSession(false);
            var session = req.getSession();
            var bar = session.get("bar");
            bar.qaz = "not woah";
            return true;
          });

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

        it("does not update session properties when clearing non-existant attribute", function() {
          /**
           * @param {Alexa.request} req
           * @param {Alexa.response} res
           * @param {string} type
           */
          testApp.pre = function(req, res, type) {
            var session = req.getSession();
            session.set("foo", true);
            session.set("bar", {
              qaz: "woah"
            });
          };

          testApp.intent("airportInfoIntent", {}, function(req, res) {
            res.say("message").shouldEndSession(false);
            var session = req.getSession();
            session.clear("baz");
            return true;
          });

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

        it("updates session properties with explicit set", function() {
          /**
           * @param {Alexa.request} req
           * @param {Alexa.response} res
           * @param {string} type
           */
          testApp.pre = function(req, res, type) {
            var session = req.getSession();
            session.set("foo", true);
            session.set("bar", {
              qaz: "woah"
            });
          };

          testApp.intent("airportInfoIntent", {}, function(req, res) {
            res.say("message").shouldEndSession(false);
            var session = req.getSession();
            var bar = session.get("bar");
            bar.qaz = "not woah";
            session.set("bar", bar);
            session.set("foo", false);
            return true;
          });

          var subject = testApp.request(mockRequest).then(function(response) {
            return response.sessionAttributes;
          });

          return Promise.all([
            expect(subject).to.eventually.become({
              foo: false,
              bar: {
                qaz: "not woah"
              }
            })
          ]);
        });
      });
    });

    describe("#response", function() {
      var mockRequest = mockHelper.load("intent_request_airport_info.json");

      context("intent handler with shouldEndSession = false", function() {
        it("responds with an empty session object after clearing session", function() {
          testApp.intent("airportInfoIntent", {}, function(req, res) {
            res.say("hi").shouldEndSession(false);
            res.session("foo", true);
            res.session("bar", {
              qaz: "woah"
            });
            res.clearSession();
            return true;
          });

          var subject = testApp.request(mockRequest).then(function(response) {
            return response.sessionAttributes;
          });
          return Promise.all([
            expect(subject).to.eventually.become({})
          ]);
        });
      });

      context("intent handler without shouldEndSession", function() {
        it("responds without shouldEndSession", function() {
          testApp.intent("airportInfoIntent", {}, function(req, res) {
            res.say("hi").shouldEndSession();
            res.session("foo", true);
            res.session("bar", {
              qaz: "woah"
            });
            res.clearSession();
            return true;
          });

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
          testApp.intent("airportInfoIntent", {}, function(req, res) {
            res.say("hi").shouldEndSession(false);
            res.session("foo", true);
            res.session("bar", {
              qaz: "woah"
            });
            res.clearSession("bar");
            return true;
          });

          var subject = testApp.request(mockRequest).then(function(response) {
            return response.sessionAttributes;
          });

          return Promise.all([
            expect(subject).to.eventually.become({
              "foo": true
            })
          ]);
        });

      });
    });

    describe("#response", function() {
      var mockRequest = mockHelper.load("intent_request_airport_info.json");

      context("intent handler with shouldEndSession = false", function() {
        it("responds with a copied session object", function() {
          testApp.intent("airportInfoIntent", {}, function(req, res) {
            res.say("hi").shouldEndSession(false);
            res.session("bar", {
              qaz: "woah"
            });
            res.session("foo", res.session("bar"));
            return true;
          });

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

          testApp.intent("airportInfoIntent", {}, function(req, res) {
            res.say("hi").shouldEndSession(false, expectedReprompt);
            return true;
          });

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
          /**
           * @param {Alexa.request} req
           * @param {Alexa.response} res
           * @param {string} type
           */
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

        it("session.clear() should fail the app", function() {
          /**
           * @param {Alexa.request} req
           * @param {Alexa.response} res
           * @param {string} type
           */
          testApp.pre = function(req, res, type) {
            return req.getSession().clear();
          };

          var subject = testApp.request(mockRequest);
          return expect(subject).to.eventually.be.rejectedWith(testApp.messages.NO_SESSION);
        });
      });
    });

    describe("#request", function() {
      context("request without session", function() {
        var mockRequest = mockHelper.load("audio_player_event_request.json");

        it("session.get(key) should fail the app", function() {
          var returnedAttributeValue = "overridden";

          /**
           * @param {Alexa.request} req
           * @param {Alexa.response} res
           * @param {string} type
           */
          testApp.pre = function(req, res, type) {
            returnedAttributeValue = req.getSession().get("AttributeWhichDoesNotExist");
          };

          var subject = testApp.request(mockRequest);
          return expect(subject).to.eventually.be.rejectedWith(testApp.messages.NO_SESSION);
        });
      });
    });

    describe("#request", function() {
      context("request with session", function() {
        var mockRequest = mockHelper.load("intent_request_airport_info.json");

        it("session.get(key) should not throw if attribute is not present", function() {
          var returnedAttributeValue = "overridden";

          /**
           * @param {Alexa.request} req
           * @param {Alexa.response} res
           * @param {string} type
           */
          testApp.pre = function(req, res, type) {
            returnedAttributeValue = req.getSession().get("AttributeWhichDoesNotExist");
          };

          return testApp.request(mockRequest).then(function() {
            expect(returnedAttributeValue).to.be.undefined;
          });
        });
      });
    });

    describe("#request", function() {
      context("request with session", function() {
        var mockRequest = mockHelper.load("intent_request_airport_info.json");

        it("should respond to changes to request.type() performed in app.pre", function() {
          /**
           * @param {Alexa.request} req
           * @param {Alexa.response} res
           * @param {string} type
           */
          testApp.pre = function(req, res, type) {
            req.data.request.type = 'Some Invalid Request Type';
          };

          return testApp.request(mockRequest).then(function(result) {
            expect(result.response.outputSpeech.ssml).to.equal('<speak>Error: not a valid request</speak>');
          });
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

          /**
           * @param {Alexa.request} req
           * @param {Alexa.response} res
           * @param {string} type
           */
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
          /**
           * @param {Alexa.request} req
           * @param {Alexa.response} res
           * @param {string} type
           */
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
          /**
           * @param {Alexa.request} req
           * @param {Alexa.response} res
           * @param {string} type
           */
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
          it("it fails with NO_SESSION message", function() {
            /**
             * @param {Alexa.request} req
             * @param {Alexa.response} res
             * @param {string} type
             */
            testApp.pre = function(req, res, type) {
              req.getSession().get("foo");
            };

            var subject = testApp.request(mockRequest).then(function(response) {
              return response;
            });

            return expect(subject).to.eventually.be.rejectedWith(testApp.messages.NO_SESSION);
          });
        });

        context("trying to set session variable", function() {
          it("it fails with NO_SESSION message", function() {
            /**
             * @param {Alexa.request} req
             * @param {Alexa.response} res
             * @param {string} type
             */
            testApp.pre = function(req, res, type) {
              req.getSession().set("foo", "bar");
            };

            var subject = testApp.request(mockRequest).then(function(response) {
              return response.response.outputSpeech;
            });

            return expect(subject).to.eventually.be.rejectedWith(testApp.messages.NO_SESSION);
          });

        });
      });
    });

    describe("intent request with malformed session", function() {
      var mockRequest = mockHelper.load("intent_request_malformed_session.json");

      it("responds a valid session object", function() {
        testApp.pre = function(req, res, type) {
          if (req.hasSession()) {
            req.getSession().set("foo", "bar");
          }
        };

        var subject = testApp.request(mockRequest).then(function(response) {
          return response.sessionAttributes;
        });

        return Promise.all([
          expect(subject).to.eventually.become({
            "foo": "bar"
          })
        ]);
      });
    });

    describe("update session in post()", function() {
      var mockRequest = mockHelper.load("intent_request_malformed_session.json");

      it("responds with updated session object", function() {
        testApp.pre = function(req) {
          if (req.hasSession()) {
            req.getSession().set("foo", "bar");
          }
        };
        testApp.post = function(req) {
          if (req.hasSession()) {
            req.getSession().set("foo", "big_bar");
          }
        };
        var subject = testApp.request(mockRequest).then(function(response) {
          return response.sessionAttributes;
        });

        return Promise.all([
          expect(subject).to.eventually.become({
            "foo": "big_bar"
          })
        ]);
      });
    });
  });
});
