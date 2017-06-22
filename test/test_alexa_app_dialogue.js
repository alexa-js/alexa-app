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
    var app;

    beforeEach(function() {
      app = new Alexa.app("testApp");
    });

    describe("#request", function() {
      describe("dialogue object", function() {
        var mockRequest, intentHandler, subject;

        var setupHandlerAndSubject = function(dialogueState, handler) {
          mockRequest = mockHelper.load("intent_request_food_delivery_dialogue_" + dialogueState + ".json")

          app.intent("deliveryCreationRequest", {}, handler);

          subject = app.request(mockRequest).then(function(response) {
            return response.response.outputSpeech;
          });
        };

        describe("#dialogueState", function() {
          beforeEach(function() {
            setupHandlerAndSubject("started", function (req, res) {
              res.say(req.getDialogue().dialogueState);
              return true;
            });
          });

          it("returns an intent's dialogueState", function() {
            return expect(subject).to.eventually.become({
              ssml: "<speak>STARTED</speak>",
              type: "SSML"
            });
          });
        });

        describe("#isStarted", function() {
          context("when an intent's dialogueState is STARTED", function() {
            beforeEach(function() {
              setupHandlerAndSubject("started", function (req, res) {
                res.say(req.getDialogue().isStarted()  ? "yes" : "no");
                return true;
              });
            });

            it("reports dialogueState is STARTED", function() {
              return expect(subject).to.eventually.become({
                ssml: "<speak>yes</speak>",
                type: "SSML"
              });
            });
          });

          context("when an intent's dialogueState is not STARTED", function() {
            beforeEach(function() {
              setupHandlerAndSubject("completed", function (req, res) {
                res.say(req.getDialogue().isStarted()  ? "yes" : "no");
                return true;
              });
            });

            it("reports dialogueState is not STARTED", function() {
              return expect(subject).to.eventually.become({
                ssml: "<speak>no</speak>",
                type: "SSML"
              });
            });
          });
        });

        describe("#isInProgress", function() {
          context("when an intent's dialogueState is IN_PROGRESS", function() {
            beforeEach(function() {
              setupHandlerAndSubject("in_progress", function (req, res) {
                res.say(req.getDialogue().isInProgress()  ? "yes" : "no");
                return true;
              });
            });

            it("reports dialogueState is IN_PROGRESS", function() {
              return expect(subject).to.eventually.become({
                ssml: "<speak>yes</speak>",
                type: "SSML"
              });
            });
          });

          context("when an intent's dialogueState is not IN_PROGRESS", function() {
            beforeEach(function() {
              setupHandlerAndSubject("completed", function (req, res) {
                res.say(req.getDialogue().isInProgress()  ? "yes" : "no");
                return true;
              });
            });

            it("reports dialogueState is not IN_PROGRESS", function() {
              return expect(subject).to.eventually.become({
                ssml: "<speak>no</speak>",
                type: "SSML"
              });
            });
          });
        });

        describe("#isCompleted", function() {
          context("when an intent's dialogueState is COMPLETED", function() {
            beforeEach(function() {
              setupHandlerAndSubject("completed", function (req, res) {
                res.say(req.getDialogue().isCompleted()  ? "yes" : "no");
                return true;
              });
            });

            it("reports dialogueState is COMPLETED", function() {
              return expect(subject).to.eventually.become({
                ssml: "<speak>yes</speak>",
                type: "SSML"
              });
            });
          });

          context("when an intent's dialogueState is not COMPLETED", function() {
            beforeEach(function() {
              setupHandlerAndSubject("started", function (req, res) {
                res.say(req.getDialogue().isCompleted()  ? "yes" : "no");
                return true;
              });
            });

            it("reports dialogueState is not COMPLETED", function() {
              return expect(subject).to.eventually.become({
                ssml: "<speak>no</speak>",
                type: "SSML"
              });
            });
          });
        });
      });

      describe("dialogue response", function() {
        context("request's intent has a dialogueState of STARTED", function () {
          var mockRequest = mockHelper.load("intent_request_food_delivery_dialogue_started.json");
          var dialogueDirective = {
            type: 'Dialog.Delegate'
          };
          var intentHandler = function (req, res) {
            res.say("I'm starting your delivery").send();
            return true;
          };

          context("intent configured to delegate dialogue to Alexa", function () {
            beforeEach(function() {
              app.intent("deliveryCreationRequest", {
                "dialogue": {
                  type: "delegate"
                }
              }, intentHandler);
            });

            it("contains directive property with Dialog.Delegate directive object", function () {
              var subject = app.request(mockRequest).then(function (response) {
                return response.response.directives;
              });
              return expect(subject).to.eventually.contain(dialogueDirective);
            });

            it("does not utilize intent's intentHandler", function () {
              var subject = app.request(mockRequest).then(function (response) {
                return response.response.outputSpeech;
              });
              return expect(subject).to.not.eventually.become({
                ssml: "<speak>I'm starting your delivery</speak>",
                type: "SSML"
              });
            });
          });

          context("intent is manually handling the dialogue", function () {
            beforeEach(function() {
              app.intent("deliveryCreationRequest", {}, intentHandler);
            });

            it("contains no directive properties", function () {
              var subject = app.request(mockRequest).then(function (response) {
                return response.response.directives;
              });
              return expect(subject).to.eventually.be.empty;
            });

            it("utilizes intent's intentHandler", function () {
              var subject = app.request(mockRequest).then(function (response) {
                return response.response.outputSpeech;
              });
              return expect(subject).to.eventually.become({
                ssml: "<speak>I'm starting your delivery</speak>",
                type: "SSML"
              });
            });
          });
        });

        context("request's intent has a dialogueState of IN_PROGRESS", function () {
          var mockRequest = mockHelper.load("intent_request_food_delivery_dialogue_in_progress.json");
          var dialogueDirective = {
            type: 'Dialog.Delegate'
          };
          var intentHandler = function (req, res) {
            res.say("I'm starting your delivery").send();
            return true;
          };

          context("intent configured to delegate dialogue to Alexa", function () {
            beforeEach(function() {
              app.intent("deliveryCreationRequest", {
                "dialogue": {
                  type: "delegate"
                }
              }, intentHandler);
            });

            it("contains directive property with Dialog.Delegate directive object", function () {
              var subject = app.request(mockRequest).then(function (response) {
                return response.response.directives;
              });
              return expect(subject).to.eventually.contain(dialogueDirective);
            });

            it("does not utilize intent's intentHandler", function () {
              var subject = app.request(mockRequest).then(function (response) {
                return response.response.outputSpeech;
              });
              return expect(subject).to.not.eventually.become({
                ssml: "<speak>I'm starting your delivery</speak>",
                type: "SSML"
              });
            });
          });

          context("intent is manually handling the dialogue", function () {
            beforeEach(function() {
              app.intent("deliveryCreationRequest", {}, intentHandler);
            });

            it("contains no directive properties", function () {
              var subject = app.request(mockRequest).then(function (response) {
                return response.response.directives;
              });
              return expect(subject).to.eventually.be.empty;
            });

            it("utilizes intent's intentHandler", function () {
              var subject = app.request(mockRequest).then(function (response) {
                return response.response.outputSpeech;
              });
              return expect(subject).to.eventually.become({
                ssml: "<speak>I'm starting your delivery</speak>",
                type: "SSML"
              });
            });
          });
        });

        context("request's intent has a dialogueState of COMPLETED", function () {
          var mockRequest = mockHelper.load("intent_request_food_delivery_dialogue_completed.json");
          var dialogueDirective = {
            type: 'Dialog.Delegate'
          };
          var intentHandler = function (req, res) {
            res.say("I'm starting your delivery").send();
            return true;
          };

          context("intent configured to delegate dialogue to Alexa", function () {
            beforeEach(function() {
              app.intent("deliveryCreationRequest", {
                "dialogue": {
                  type: "delegate"
                }
              }, intentHandler);
            });

            it("contains no directive properties", function () {
              var subject = app.request(mockRequest).then(function (response) {
                return response.response.directives;
              });
              return expect(subject).to.eventually.be.empty;
            });

            it("utilizes intent's intentHandler", function () {
              var subject = app.request(mockRequest).then(function (response) {
                return response.response.outputSpeech;
              });
              return expect(subject).to.eventually.become({
                ssml: "<speak>I'm starting your delivery</speak>",
                type: "SSML"
              });
            });
          });

          context("intent is manually handling the dialogue", function () {
            beforeEach(function() {
              app.intent("deliveryCreationRequest", {}, intentHandler);
            });

            it("contains no directive properties", function () {
              var subject = app.request(mockRequest).then(function (response) {
                return response.response.directives;
              });
              return expect(subject).to.eventually.be.empty;
            });

            it("utilizes intent's intentHandler", function () {
              var subject = app.request(mockRequest).then(function (response) {
                return response.response.outputSpeech;
              });
              return expect(subject).to.eventually.become({
                ssml: "<speak>I'm starting your delivery</speak>",
                type: "SSML"
              });
            });
          });
        });
      });
    });
  });
});
