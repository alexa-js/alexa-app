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
      describe("cards response", function() {
        var mockRequest = mockHelper.load("intent_request_airport_info.json");
        context("with an intent request of airportInfoIntent", function() {
          var app = new Alexa.app("myapp");
          var intentHandler = function(req, res) {
            res.say(expectedMessage);
            return true;
          };
          var expectedMessage = "tubular!";
          app.intent("airportInfoIntent", {
            "slots": {
              "AIRPORTCODE": "FAACODES"
            },
            "utterances": ["{|flight|airport} {|delay|status} {|info} {|for} {-|AIRPORTCODE}"]
          }, intentHandler);

          describe("intent handler with card and say function called", function() {
            it("responds with a speech and card", function() {
              app = new Alexa.app("myapp");
              var cardTitle = "radCard";
              var cardContent = "MyCard Content!";
              intentHandler = function(req, res) {
                res.say(expectedMessage).card(cardTitle, cardContent);
                return true;
              };
              app.intent("airportInfoIntent", {
                "slots": {
                  "AIRPORTCODE": "FAACODES"
                },
                "utterances": ["{|flight|airport} {|delay|status} {|info} {|for} {-|AIRPORTCODE}"]
              }, intentHandler);
              var subject = app.request(mockRequest);
              var alexaResponse = subject.then(function(response) {
                return response.response.outputSpeech;
              });
              var cardResponse = subject.then(function(response) {
                return response.response.card;
              });
              return Promise.all([
                expect(alexaResponse).to.eventually.become({
                  ssml: "<speak>" + expectedMessage + "</speak>",
                  type: "SSML"
                }),
                expect(cardResponse).to.eventually.become({
                  "content": "MyCard Content!",
                  "title": "radCard",
                  "type": "Simple"
                }),
              ]);
            //return expect(subject).to.eventually.become({
            //});
            });
          });
        });
      });
    });
  });
});
