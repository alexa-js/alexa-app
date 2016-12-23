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
    var app = new Alexa.app("myapp");
    describe("request", function () {
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
            Url = "someurl.com",
            token = "some_token",
            playBehavior = "ENQUEUE",
            offsetInMilliseconds = 1000,
            expectedPreviousToken = "some_previous_token";
          it("contains AudioPlayer directive array property", function () {
            var intentHandler = function (req, res) {
              res.audioPlayerPlay(Url, token);
              return true;
            };
            app.intent("audioPlayerIntent", {}, intentHandler);
            var subject = app.request(mockRequest);
            subject = subject.then(function (response) {
              return response.response.directives;
            });
            return expect(subject).to.eventually.be.an("array");
          });
          it("audioPlayerPlay directive can take url & token", function () {
            var intentHandler = function (req, res) {
              res.audioPlayerPlay(Url, token);
              return true;
            };
            app.intent("audioPlayerIntent", {}, intentHandler);
            var subject = app.request(mockRequest).then(function (response) {
              return response.response.directives[0];
            });
            return expect(subject).to.eventually.become({
              type: 'AudioPlayer.Play',
              playBehavior: 'REPLACE_ALL',
              audioItem: {
                stream: {
                  url: 'someurl.com',
                  token: 'some_token',
                  expectedPreviousToken: undefined,
                  offsetInMilliseconds: 0
                }
              }
            });
          });
          it("audioPlayerPlay directive can take url, token, & playBehavior ", function () {
            var intentHandler = function (req, res) {
              res.audioPlayerPlay(Url, token, playBehavior);
              return true;
            };
            app.intent("audioPlayerIntent", {}, intentHandler);
            var subject = app.request(mockRequest).then(function (response) {
              return response.response.directives[0];
            });
            return expect(subject).to.eventually.become({
              type: 'AudioPlayer.Play',
              playBehavior: 'ENQUEUE',
              audioItem: {
                stream: {
                  url: 'someurl.com',
                  token: 'some_token',
                  expectedPreviousToken: undefined,
                  offsetInMilliseconds: 0
                }
              }
            });
          });
          it("audioPlayerPlay directive can take url, token, playBehavior, & offsetInMilliseconds", function () {
            var intentHandler = function (req, res) {
              res.audioPlayerPlay(Url, token, playBehavior, offsetInMilliseconds);
              return true;
            };
            app.intent("audioPlayerIntent", {}, intentHandler);
            var subject = app.request(mockRequest).then(function (response) {
              return response.response.directives[0];
            });
            return expect(subject).to.eventually.become({
              type: 'AudioPlayer.Play',
              playBehavior: 'ENQUEUE',
              audioItem: {
                stream: {
                  url: 'someurl.com',
                  token: 'some_token',
                  expectedPreviousToken: undefined,
                  offsetInMilliseconds: 1000
                }
              }
            });
          });
          it("audioPlayerPlay directive can take url, token, playBehavior, offsetInMilliseconds, & expectedPreviousToken", function () {
            var intentHandler = function (req, res) {
              res.audioPlayerPlay(Url, token, playBehavior, offsetInMilliseconds, expectedPreviousToken);
              return true;
            };
            app.intent("audioPlayerIntent", {}, intentHandler);
            var subject = app.request(mockRequest).then(function (response) {
              return response.response.directives[0];
            });
            return expect(subject).to.eventually.become({
              type: 'AudioPlayer.Play',
              playBehavior: 'ENQUEUE',
              audioItem: {
                stream: {
                  url: 'someurl.com',
                  token: 'some_token',
                  expectedPreviousToken: "some_previous_token",
                  offsetInMilliseconds: 1000
                }
              }
            });
          });
          it("audioPlayerStop directive", function() {
            var intentHandler = function(req, res) {
              res.audioPlayerStop();
              return true;
            };
            app.intent("audioPlayerIntent", {}, intentHandler);
            var subject = app.request(mockRequest).then(function (response) {
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
            app.intent("audioPlayerIntent", {}, intentHandler);
            var subject = app.request(mockRequest).then(function (response) {
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
            app.intent("audioPlayerIntent", {}, intentHandler);
            var subject = app.request(mockRequest).then(function (response) {
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
      context("but there is not PlaybackFinished event handler", function() {
        describe("outputSpeech", function() {
          var subject = app.request(mockRequest).then(function(response) {
            return response.response.outputSpeech;
          });
          it("responds with NO_AUDIO_PLAYER_EVENT_HANDLER_FOUND message", function() {
            return expect(subject).to.eventually.become({
              ssml: "<speak>" + app.messages.NO_AUDIO_PLAYER_EVENT_HANDLER_FOUND + "</speak>",
              type: "SSML"
            });
          });
        });
      });
      context("set PlaybackFinished event handler with play directive", function() {
        var url = "https://testing";
        var token = "some token";
        var playBehavior = "ENQUEUE";
        app.audioPlayer("PlaybackFinished", function(request, response) {
          response.audioPlayerPlay(url, token, playBehavior);
        });
        describe("response", function() {
          var subject = app.request(mockRequest).then(function(response) {
            return response.response.directives[0];
          });
          it("with NO_AUDIO_PLAYER_EVENT_HANDLER_FOUND message", function() {
            return expect(subject).to.eventually.become({
              type: 'AudioPlayer.Play',
              playBehavior: playBehavior,
              audioItem: {
                stream: {
                  url: url,
                  token: token,
                  expectedPreviousToken: undefined,
                  offsetInMilliseconds: 0
                }
              }
            });
          });
        });
      });
      context("set PlaybackFinished event handler with async response", function () {
        var url = "https://testing";
        var token = "some token";
        var playBehavior = "ENQUEUE";
        app.audioPlayer("PlaybackFinished", function(request, response) {
          setTimeout(function() {
            response.audioPlayerPlay(url, token, playBehavior);
            response.send();
          }, 0);
          return false;
        });
        describe("response", function() {
          var subject = app.request(mockRequest).then(function(response) {
            return response.response.directives[0];
          });
          it("with NO_AUDIO_PLAYER_EVENT_HANDLER_FOUND message", function() {
            return expect(subject).to.eventually.become({
              type: 'AudioPlayer.Play',
              playBehavior: playBehavior,
              audioItem: {
                stream: {
                  url: url,
                  token: token,
                  expectedPreviousToken: undefined,
                  offsetInMilliseconds: 0
                }
              }
            });
          });
        });
      });
    });
  });
});
