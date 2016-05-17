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
    var setupIntentHandler = function(handlerFunction) {
      app = new Alexa.app("myapp");
      app.intent("airportInfoIntent", {}, handlerFunction);
    };

    describe("#request", function() {
      describe("cards response", function() {
        var mockRequest = mockHelper.load("intent_request_airport_info.json");
        context("with an intent request of airportInfoIntent", function() {
          var intentHandler = function(req, res) {
            res.say(expectedMessage);
            return true;
          };
          setupIntentHandler(intentHandler);
          var expectedMessage = "tubular!";

          describe("intent handler with AccountLink called on res", function() {
            it("responds with a account link card", function() {
              intentHandler = function(req, res) {
                res.linkAccount();
              };
              setupIntentHandler(intentHandler);
              var subject = app.request(mockRequest);
              var cardResponse = subject.then(function(response) {
                return response.response.card;
              });
              return expect(cardResponse).to.eventually.become({
                "type": "LinkAccount"
              });
            });
          });

          describe("with a missing required attribute", function() {
            describe("of a known type", function() {
              it("adds no card response", function() {
                var intentHandler = function(req, res) {
                  res.say("sweet!").card({
                    type: "Simple"
                  });
                };
                setupIntentHandler(intentHandler);
                var subject = app.request(mockRequest);
                var cardResponse = subject.then(function(response) {
                  console.log(response.response);
                  return response.response;
                });
                expect(cardResponse).to.eventually.not.have.property("card");
              });
            });
            describe("of an unknown type", function() {
              it("adds no card response", function() {
                var intentHandler = function(req, res) {
                  res.say("sweet!").card({});
                };
                setupIntentHandler(intentHandler);
                var subject = app.request(mockRequest);
                var cardResponse = subject.then(function(response) {
                  return response.response.card;
                });
                expect(cardResponse).to.eventually.become({});
              });
            });
          });

          describe("intent handler with card and say function called on res", function() {
            it("responds with a speech and card using deprecated api", function() {
              var cardTitle = "radCard";
              var cardContent = "MyCard Content!";
              intentHandler = function(req, res) {
                res.say(expectedMessage).card(cardTitle, cardContent);
                return true;
              };
              setupIntentHandler(intentHandler);
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
            });

            it("responds with a speech and simple card", function() {
              var oCard = {
                  type: "Simple",
                  title: "My Cool Card",
                  content: "This is the\ncontent of my card"
                },
                expectedCard = JSON.parse(JSON.stringify(oCard));

              intentHandler = function(req, res) {
                res.say(expectedMessage).card(oCard);
                return true;
              };
              setupIntentHandler(intentHandler);
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
                expect(cardResponse).to.eventually.become(expectedCard),
              ]);
            });

            it("responds with a speech and standard card with images", function() {
              var oCard = {
                  type: "Standard",
                  title: "My Cool Card",
                  text: "Your ride is on the way to 123 Main Street!\nEstimated cost for this ride: $25",
                  image: {
                    smallImageUrl: "https://carfu.com/resources/card-images/race-car-small.png",
                    largeImageUrl: "https://carfu.com/resources/card-images/race-car-large.png"
                  }
                },
                expectedCard = JSON.parse(JSON.stringify(oCard));

              intentHandler = function(req, res) {
                res.say(expectedMessage).card(oCard);
                return true;
              };
              setupIntentHandler(intentHandler);
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
                expect(cardResponse).to.eventually.become(expectedCard),
              ]);
            });

            it("responds with a speech and no card because it was called with invalid info", function() {
              var oCard = {
                  type: "Standard",
                  title: "My Cool Card",
                  text: "Your ride is on the way to 123 Main Street!\nEstimated cost for this ride: $25",
                  image: {}
                },
                expectedCard = undefined;

              intentHandler = function(req, res) {
                res.say(expectedMessage).card(oCard);
                return true;
              };
              setupIntentHandler(intentHandler);
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
                expect(cardResponse).to.eventually.become(expectedCard),
              ]);
            });

          });
        });
      });
    });
  });
});
