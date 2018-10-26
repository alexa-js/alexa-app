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

    describe("airportInfoIntent request", function() {
      var mockRequest = mockHelper.load("intent_request_airport_info.json");

      context("route request to welcome intent", function() {
        it("output speech contains text from both intents", function() {

          testApp.intent("airportInfoIntent", {}, function (req, res) {
            res.say("It's airportInfoIntent");
            return req.getRouter().intent("welcome");
          });

          testApp.intent("welcome", {}, function (req, res) {
            res.say("and welcome!");
          });

          var speech = testApp.request(mockRequest).then(function (response) {
            return response.response.outputSpeech;
          });

          return Promise.all([
            expect(speech).to.eventually.become({
              ssml: "<speak>It's airportInfoIntent and welcome!</speak>",
              type: "SSML"
            })
          ]);
        });
      });

      context("route request to undefined intent", function() {
        it("output speech contains NO_INTENT_FOUND response", function() {

          testApp.intent("airportInfoIntent", {}, function (req, res) {
            return req.getRouter().intent("noSuchIntent");
          });

          var speech = testApp.request(mockRequest).then(function (response) {
            return response.response.outputSpeech;
          });

          return Promise.all([
            expect(speech).to.eventually.become({
              ssml: "<speak>" + testApp.messages.NO_INTENT_FOUND + "</speak>",
              type: "SSML"
            })
          ]);
        });
      });

      context("route request to launch function", function() {
        it("output speech contains text from launch callback", function() {

          testApp.launch(function(req, res) {
            res.clear();
            res.say("Welcome to Airport Info Skill");
          });
          testApp.intent("airportInfoIntent", {}, function (req, res) {
            res.say("It's airportInfoIntent");
            return req.getRouter().launch();
          });

          var speech = testApp.request(mockRequest).then(function (response) {
            return response.response.outputSpeech;
          });

          return Promise.all([
            expect(speech).to.eventually.become({
              ssml: "<speak>Welcome to Airport Info Skill</speak>",
              type: "SSML"
            })
          ]);
        });
      });

      context("route request to custom request handler", function() {
        it("output speech contains text from sayHello custom request handler", function() {

          testApp.on("sayHello", function(req, res) {
            res.clear();
            res.say("Hello!");
          });
          testApp.intent("airportInfoIntent", {}, function (req, res) {
            res.say("It's airportInfoIntent");
            return req.getRouter().custom("sayHello");
          });

          var speech = testApp.request(mockRequest).then(function (response) {
            return response.response.outputSpeech;
          });

          return Promise.all([
            expect(speech).to.eventually.become({
              ssml: "<speak>Hello!</speak>",
              type: "SSML"
            })
          ]);
        });
      });

      context("route request to NextCommandIssued handler of playbackController through PlaybackNearlyFinished", function() {
        var stream = {
          "url": "https://next-song-url",
          "token": "some_token",
          "expectedPreviousToken": undefined,
          "offsetInMilliseconds": 0
        };

        beforeEach(function() {
          testApp.intent("airportInfoIntent", {}, function (req, res) {
            res.say("It's airportInfoIntent");
            return req.getRouter().playbackController("NextCommandIssued");
          });

          testApp.playbackController("NextCommandIssued", function (req) {
            return req.getRouter().audioPlayer("PlaybackNearlyFinished");
          });

          testApp.audioPlayer("PlaybackNearlyFinished", function (req, res) {
            res.audioPlayerPlayStream("REPLACE_ALL", stream);
          });
        });

        it("output speech contains text from airportInfoIntent", function() {

          var speech = testApp.request(mockRequest).then(function (response) {
            return response.response.outputSpeech;
          });

          return Promise.all([
            expect(speech).to.eventually.become({
              ssml: "<speak>It's airportInfoIntent</speak>",
              type: "SSML"
            })
          ]);
        });

        it("and AudioPlayer directive in response from PlaybackNearlyFinished AudioPlayer event handler", function() {

          var speech = testApp.request(mockRequest).then(function (response) {
            return response.response.directives[0].audioItem.stream;
          });

          return Promise.all([
            expect(speech).to.eventually.become(stream)
          ]);
        });
      });

      context("chain several routes to count from one to five", function() {
        it("output speech contains text from airportInfoIntent, oneIntent, twoIntent, threeIntent, fourIntent and fiveIntent", function() {

          testApp.intent("airportInfoIntent", {}, function (req, res) {
            res.say("Let's count!");
            return req.getRouter().intent("oneIntent").then(function() {
              return req.getRouter().intent("twoIntent");
            }).then(function() {
              return req.getRouter().intent("threeIntent");
            }).then(function() {
              return req.getRouter().intent("fourIntent");
            }).then(function() {
              return req.getRouter().intent("fiveIntent");
            });
          });

          testApp.intent("oneIntent", function (req, res) {
            res.say("one...");
          });

          testApp.intent("twoIntent", function (req, res) {
            res.say("two...");
          });

          testApp.intent("threeIntent", function (req, res) {
            res.say("three...");
          });

          testApp.intent("fourIntent", function (req, res) {
            res.say("four...");
          });

          testApp.intent("fiveIntent", function (req, res) {
            res.say("five...");
          });

          var speech = testApp.request(mockRequest).then(function (response) {
            return response.response.outputSpeech;
          });

          return Promise.all([
            expect(speech).to.eventually.become({
              ssml: "<speak>Let's count! one... two... three... four... five...</speak>",
              type: "SSML"
            })
          ]);
        });
      });


    });
  });
});
