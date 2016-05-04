/*jshint expr: true*/
"use strict";
var fs = require("fs");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;
var AlexaApp = require("../index");
chai.config.includeStack = true;

describe("Alexa", function() {
  var Alexa = require("../index");
  describe("app", function() {
    var app = new Alexa.app("myapp");

    describe("constructor", function() {
      it("sets the name of the app", function() {
        expect(app.name).to.eq("myapp");
      });
    });

    describe("#request", function() {
      context("with an intent request of airportInfoIntent", function() {
        var mockRequest = JSON.parse(fs.readFileSync("./test/fixtures/intent_request_airport_info.json", "utf8"));
        var response = app.request(mockRequest);
        context("with no schema registered", function() {
          describe("outputSpeech", function() {
            response = response.then(function(response) {
              return response.response.outputSpeech;
            });
            it("responds with NO_INTENT_FOUND message", function() {
              return expect(response).to.eventually.become({
                ssml: "<speak>" + app.messages.NO_INTENT_FOUND + "</speak>",
                type: "SSML"
              });
            });
          });
        });
      });
    });
  });
});
