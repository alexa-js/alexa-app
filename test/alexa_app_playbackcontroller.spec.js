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
    var playbackHandlerWasCalled = false;

    /** @type {Alexa.RequestHandler} */
    var playbackControllerHandler = function(req, res) {
      playbackHandlerWasCalled = true;
    };
    beforeEach(function() {
      playbackHandlerWasCalled = false;
      testApp = new Alexa.app("testApp");
    });

    describe("request", function() {

      context("with a playback controller command", function() {
        var mockRequest = mockHelper.load("playback_controller_play_command.json");

        it("should not return speech output", function() {
          return testApp.request(mockRequest)
            .should.eventually.be.fulfilled
            .and.not.have.deep.property("response.outputSpeech.type");
        });

        it("should call the matching playbackController handler", function() {
          testApp.playbackController("PlayCommandIssued", playbackControllerHandler);
          var subject = testApp.request(mockRequest).then(function(response) {
            return playbackHandlerWasCalled;
          });

          return expect(subject).to.eventually.become(true);
        });

        it("should not call other playbackController handlers", function() {
          testApp.playbackController("PreviousCommandIssued", playbackControllerHandler);
          var subject = testApp.request(mockRequest).then(function(response) {
            return playbackHandlerWasCalled;
          });

          return expect(subject).to.eventually.become(false);
        });
      });

      context("without a playback controller command", function() {
        var mockRequest = mockHelper.load("intent_request_airport_info.json");

        it("should not call the playbackController handler", function() {
          testApp.playbackController("PlayCommandIssued", playbackControllerHandler);
          var subject = testApp.request(mockRequest).then(function(response) {
            return playbackHandlerWasCalled;
          });

          return expect(subject).to.eventually.become(false);
        });

      });
    });

  });
});
