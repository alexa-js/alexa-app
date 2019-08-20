/*jshint expr: true*/
"use strict";
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var mockHelper = require("./helpers/mock_helper");
chai.use(chaiAsPromised);
var expect = chai.expect;
chai.config.includeStack = true;

import * as Alexa from '..';

describe("Alexa", function() {
  describe("app", function() {
    var testApp = new Alexa.app("testApp");

    beforeEach(function() {
      testApp = new Alexa.app("testApp");
    });

    describe("request", function() {

      context("without an audioPlayer intent", function() {
        context("AudioPlayer.PlaybackFinished", function() {
          it("should succeed and return empty object ", function() {
            return testApp.request(mockHelper.load("audio_player_events/playback_finished.json"))
              .should.eventually.be.fulfilled
              .and.not.have.deep.property("response.outputSpeech.type");
          });
        });

        context("AudioPlayer.PlaybackFailed", function() {
          it("should succeed and return empty object ", function() {
            return testApp.request(mockHelper.load("audio_player_events/playback_failed.json"))
              .should.eventually.be.fulfilled
              .and.not.have.deep.property("response.outputSpeech.type");
          });
        });

        context("AudioPlayer.PlaybackNearlyFinished", function() {
          it("should succeed and return empty object ", function() {
            return testApp.request(mockHelper.load("audio_player_events/playback_nearly_finished.json"))
              .should.eventually.be.fulfilled
              .and.not.have.deep.property("response.outputSpeech.type");
          });
        });


        context("AudioPlayer.PlaybackStarted", function() {
          it("should succeed and return empty object ", function() {
            return testApp.request(mockHelper.load("audio_player_events/playback_started.json"))
              .should.eventually.be.fulfilled
              .and.not.have.deep.property("response.outputSpeech.type");
          });
        });

        context("AudioPlayer.PlaybackStopped", function() {
          it("should succeed and return empty object ", function() {
            return testApp.request(mockHelper.load("audio_player_events/playback_stopped.json"))
              .should.eventually.be.fulfilled
              .and.not.have.deep.property("response.outputSpeech.type");
          });
        });
      });

      context("with an audioPlayer intent", function() {
        var mockRequest = mockHelper.load("intent_audioplayer.json");
        it("includes the context object", function() {
          return expect(mockRequest.request).to.have.property("context");
        });
        it("request includes AudioPlayer object", function() {
          return expect(mockRequest.request).to.have.property("AudioPlayer");
        });
      });

      describe("response", function() {
        context("alexa directive response", function() {
          var mockRequest = mockHelper.load("intent_audioplayer.json"),
            playBehavior = "ENQUEUE",
            stream = {
              url: "someurl.com",
              token: "some_token",
              expectedPreviousToken: "some_previous_token",
              offsetInMilliseconds: 1000
            };

          it("contains AudioPlayer directive array property", function() {
            testApp.intent("audioPlayerIntent", {}, function(req, res) {
              res.audioPlayerPlayStream(playBehavior, stream);
              return true;
            });
            var subject = testApp.request(mockRequest).then(function(response) {
              return response.response.directives;
            });
            return expect(subject).to.eventually.be.an("array");
          });

          it("audioPlayerPlay directive contains stream object", function() {
            testApp.intent("audioPlayerIntent", {}, function(req, res) {
              res.audioPlayerPlayStream(playBehavior, stream);
              return true;
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

          it("audioPlayerStop directive", function() {
            testApp.intent("audioPlayerIntent", {}, function(req, res) {
              res.audioPlayerStop();
              return true;
            });
            var subject = testApp.request(mockRequest).then(function(response) {
              return response.response.directives[0];
            });
            return expect(subject).to.eventually.become({
              type: 'AudioPlayer.Stop'
            });
          });

          it("audioPlayerClearQueue w/o clearBehavior arg", function() {
            testApp.intent("audioPlayerIntent", {}, function(req, res) {
              res.audioPlayerClearQueue();
              return true;
            });
            var subject = testApp.request(mockRequest).then(function(response) {
              return response.response.directives[0];
            });
            return expect(subject).to.eventually.become({
              type: 'AudioPlayer.ClearQueue',
              clearBehavior: "CLEAR_ALL"
            });
          });
          it("audioPlayerClearQueue w/ clearBehavior arg", function() {
            testApp.intent("audioPlayerIntent", {}, function(req, res) {
              res.audioPlayerClearQueue("CLEAR_ENQUEUED");
              return true;
            });
            var subject = testApp.request(mockRequest).then(function(response) {
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
            /** @type {Alexa.Stream} */
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

      context("set PlaybackFinished event handler with async response", function() {
        describe("response", function() {
          it("with NO_AUDIO_PLAYER_EVENT_HANDLER_FOUND message", function() {
            /** @type {Alexa.Stream} */
            var stream = {
              url: "https://testing",
              token: "some token",
              expectedPreviousToken: undefined,
              offsetInMilliseconds: 0
            };

            var playBehavior = "ENQUEUE";

            testApp.audioPlayer("PlaybackFinished", function(request, response) {
              return new Promise(function(resolve) {
                setTimeout(function() {
                  response.audioPlayerPlayStream(playBehavior, stream);
                  resolve();
                }, 0);
              }).then(function() {
                return response.send();
              });
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
