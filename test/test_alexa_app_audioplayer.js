/*jshint expr: true*/
"use strict";
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var mockHelper = require("./helpers/mock_helper");
chai.use(chaiAsPromised);
var expect = chai.expect;
chai.config.includeStack = true;


describe("Alexa", function () {
  var Alexa = require("../index");

  describe("app", function () {
    var testApp;
    beforeEach(() => {
      testApp = new Alexa.app("testApp");
    });

    describe("request", function () {

      context("without an audioPlayer intent", function () {
        context("AudioPlayer.PlaybackFinished", () => {
          var mockRequest;
          beforeEach(() => { mockRequest = mockHelper.load("audio_player_events/playback_finished.json"); })

          it("should succeed and return empty object ", () => {
            return testApp.request(mockRequest)
              .should.eventually.be.fulfilled
              .and.not.have.deep.property("response.outputSpeech.type");
          });
        });

        context("AudioPlayer.PlaybackFailed", () => {
          var mockRequest;
          beforeEach(() => { mockRequest = mockHelper.load("audio_player_events/playback_failed.json"); })

          it("should succeed and return empty object ", () => {
            return testApp.request(mockRequest)
              .should.eventually.be.fulfilled
              .and.not.have.deep.property("response.outputSpeech.type");
          });
        });

        context("AudioPlayer.PlaybackNearlyFinished", () => {
          var mockRequest;
          beforeEach(() => { mockRequest = mockHelper.load("audio_player_events/playback_nearly_finished.json"); })

          it("should succeed and return empty object ", () => {
            return testApp.request(mockRequest)
              .should.eventually.be.fulfilled
              .and.not.have.deep.property("response.outputSpeech.type");
          });
        });


        context("AudioPlayer.PlaybackStarted", () => {
          var mockRequest;
          beforeEach(() => { mockRequest = mockHelper.load("audio_player_events/playback_started.json"); })

          it("should succeed and return empty object ", () => {
            return testApp.request(mockRequest)
              .should.eventually.be.fulfilled
              .and.not.have.deep.property("response.outputSpeech.type");
          });
        });

        context("AudioPlayer.PlaybackStopped", () => {
          var mockRequest;
          beforeEach(() => { mockRequest = mockHelper.load("audio_player_events/playback_stopped.json"); })

          it("should succeed and return empty object ", () => {
            return testApp.request(mockRequest)
              .should.eventually.be.fulfilled
              .and.not.have.deep.property("response.outputSpeech.type");
          });
        });
      });

      context("with an audioPlayer intent", function () {
        var mockRequest = mockHelper.load("intent_audioplayer.json");
        it("includes the context object", function () {
          return expect(mockRequest.request).to.have.property("context");
        });
        it("request includes AudioPlayer object", function () {
          return expect(mockRequest.request).to.have.property("AudioPlayer");
        });
      });

      describe("response", function () {
        context("alexa directive response", function () {
          var mockRequest = mockHelper.load("intent_audioplayer.json"),
            playBehavior = "ENQUEUE",
            stream = {
              url: "someurl.com",
              token: "some_token",
              expectedPreviousToken: "some_previous_token",
              offsetInMilliseconds: 1000
            };
          var intentHandler = function (req, res) {
            res.audioPlayerPlayStream(playBehavior, stream);
            return true;
          };

          it("contains AudioPlayer directive array property", function () {
            testApp.intent("audioPlayerIntent", {}, intentHandler);
            var subject = testApp.request(mockRequest).then(function (response) {
              return response.response.directives;
            });
            return expect(subject).to.eventually.be.an("array");
          });

          it("audioPlayerPlay directive contains stream object", function () {
            testApp.intent("audioPlayerIntent", {}, intentHandler);
            var subject = testApp.request(mockRequest).then(function (response) {
              return response.response.directives[0];
            });
            return expect(subject).to.eventually.become({
              type: 'AudioPlayer.Play',
              playBehavior: playBehavior,
              audioItem: {
                stream: stream
              }
            });
          });

          it("audioPlayerStop directive", function() {
            var intentHandler = function(req, res) {
              res.audioPlayerStop();
              return true;
            };
            testApp.intent("audioPlayerIntent", {}, intentHandler);
            var subject = testApp.request(mockRequest).then(function (response) {
              return response.response.directives[0];
            });
            return expect(subject).to.eventually.become({
              type: 'AudioPlayer.Stop'
            });
          });

          it("audioPlayerClearQueue w/o clearBehavior arg", function() {
            var intentHandler = function(req, res) {
              res.audioPlayerClearQueue();
              return true;
            };
            testApp.intent("audioPlayerIntent", {}, intentHandler);
            var subject = testApp.request(mockRequest).then(function (response) {
              return response.response.directives[0];
            });
            return expect(subject).to.eventually.become({
              type: 'AudioPlayer.ClearQueue',
              clearBehavior: "CLEAR_ALL"
            });
          });
          it("audioPlayerClearQueue w/ clearBehavior arg", function() {
            var intentHandler = function(req, res) {
              res.audioPlayerClearQueue("CLEAR_ENQUEUED");
              return true;
            };
            testApp.intent("audioPlayerIntent", {}, intentHandler);
            var subject = testApp.request(mockRequest).then(function (response) {
              return response.response.directives[0];
            });
            return expect(subject).to.eventually.become({
              type: 'AudioPlayer.ClearQueue',
              clearBehavior: "CLEAR_ENQUEUED"
            });
          });
        });
      });
    });

    describe("request with AudioPlayer.PlaybackFinished type", function() {
      var mockRequest = mockHelper.load("audio_player_event_request.json");

      context("set PlaybackFinished event handler with play directive", function() {
        describe("response", function() {
          it("with NO_AUDIO_PLAYER_EVENT_HANDLER_FOUND message", function() {
            var stream = {
              url: "https://testing",
              token: "some token",
              expectedPreviousToken: undefined,
              offsetInMilliseconds: 0
            };

            var playBehavior = "ENQUEUE";

            testApp.audioPlayer("PlaybackFinished", function(request, response) {
              response.audioPlayerPlayStream(playBehavior, stream);
            });

            var subject = testApp.request(mockRequest).then(function(response) {
              return response.response.directives[0];
            });

            return expect(subject).to.eventually.become({
              type: 'AudioPlayer.Play',
              playBehavior: playBehavior,
              audioItem: {
                stream: stream
              }
            });
          });
        });
      });

      context("set PlaybackFinished event handler with async response", function () {
        describe("response", function() {
          it("with NO_AUDIO_PLAYER_EVENT_HANDLER_FOUND message", function() {
            var stream = {
              url: "https://testing",
              token: "some token",
              expectedPreviousToken: undefined,
              offsetInMilliseconds: 0
            };

            var playBehavior = "ENQUEUE";

            testApp.audioPlayer("PlaybackFinished", function(request, response) {
              setTimeout(function() {
                response.audioPlayerPlayStream(playBehavior, stream);
                response.send();
              }, 0);
              return false;
            });

            var subject = testApp.request(mockRequest).then(function(response) {
              return response.response.directives[0];
            });

            return expect(subject).to.eventually.become({
              type: 'AudioPlayer.Play',
              playBehavior: playBehavior,
              audioItem: {
                stream: stream
              }
            });
          });
        });
      });
    });
  });
});
