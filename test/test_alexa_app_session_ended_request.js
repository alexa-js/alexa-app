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
    describe("sessionEnded #request", function() {
      describe("response", function() {

        var mockRequest = mockHelper.load("session_ended_request.json");

        it("invokes a globally defined sessionEnded function", function() {
          app = new Alexa.app("myapp");

          app.sessionEnded(function(request, response) {
            return true;
          });

          var subject = app.request(mockRequest);
          return expect(subject).to.eventually.become({
            response: {
              directives: [],
              shouldEndSession: true
            },
            sessionAttributes: {},
            version: "1.0"
          });
        });
      });
    });
  });
});
