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
    describe("request", function() {
      var app = new Alexa.app("myapp");
      var requestContext, appId;
      app.pre = function(request, response) {
        requestContext = request.context();
        appId = request.applicationId;
      };

      describe("with context", function() {
        var mockRequest = mockHelper.load("audio_player_event_request.json");
        it("request json contains context, but without session", function() {
          return expect(mockRequest).to.have.property("context") && expect(mockRequest).to.not.have.property("session");
        });
        it("app request context is an object", function() {
          app.request(mockRequest);
          return expect(requestContext).to.be.an("object");
        });
        it("request.applicationId is not null", function() {
          app.request(mockRequest);
          return expect(appId).to.not.be.null;
        });
      });

      describe("without context but with session", function() {
        var mockRequest = mockHelper.load("intent_request_airport_info.json");
        it("request json contains session, but without context object", function() {
          return expect(mockRequest).to.have.property("session") && expect(mockRequest).to.not.have.property("context");
        });
        it("app request context exists", function() {
          app.request(mockRequest);
          return expect(requestContext).to.be.an("object");
        });
        it("request.applicationId is not null", function() {
          app.request(mockRequest);
          return expect(appId).to.not.be.null;
        });
      });

      describe("without context and session", function() {
        var mockRequest = mockHelper.load("pure_intent_request.json");
        it("request json doesn't have context object and session object", function() {
          return expect(mockRequest).to.not.have.property("context") && expect(mockRequest).to.not.have.property("session");
        });
        it("app request context is null", function() {
          app.request(mockRequest);
          return expect(requestContext).to.be.null;
        });
        it("request.applicationId is null", function() {
          app.request(mockRequest);
          return expect(appId).to.be.null;
        });
      });

    });
  });
});
