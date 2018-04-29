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
    var app = new Alexa.app("testApp");

    beforeEach(function() {
      app = new Alexa.app("testApp");
    });

    describe("#request", function() {
      describe("dialog object", function() {
        var mockRequest, intentHandler;

        /** @type {Promise<Alexa.OutputSpeech|undefined>} */
        var subject;

        /**
         * @param {string} dialogState
         * @param {Alexa.RequestHandler} handler
         */
        var setupHandlerAndSubject = function(dialogState, handler) {
          mockRequest = mockHelper.load("intent_request_food_delivery_dialog_" + dialogState + ".json")

          app.intent("deliveryCreationRequest", {}, handler);

          subject = app.request(mockRequest).then(function(response) {
            return response.response.outputSpeech;
          });
        };

        describe("#dialogState", function() {
          beforeEach(function() {
            setupHandlerAndSubject("started", function(req, res) {
              res.say(req.getDialog().dialogState);
              return true;
            });
          });

          it("returns an intent's dialogState", function() {
            return expect(subject).to.eventually.become({
              ssml: "<speak>STARTED</speak>",
              type: "SSML"
            });
          });
        });

        describe("#isStarted", function() {
          context("when an intent's dialogState is STARTED", function() {
            beforeEach(function() {
              setupHandlerAndSubject("started", function(req, res) {
                res.say(req.getDialog().isStarted() ? "yes" : "no");
                return true;
              });
            });

            it("reports dialogState is STARTED", function() {
              return expect(subject).to.eventually.become({
                ssml: "<speak>yes</speak>",
                type: "SSML"
              });
            });
          });

          context("when an intent's dialogState is not STARTED", function() {
            beforeEach(function() {
              setupHandlerAndSubject(undefined, function(req, res) {
                res.say(req.getDialog().isStarted() ? "yes" : "no");
                return true;
              });
            });

            it("reports dialogState is not STARTED", function() {
              return expect(subject).to.eventually.become({
                ssml: "<speak>no</speak>",
                type: "SSML"
              });
            });
          });

          context("when an intent's dialogState is undefined", function() {
            beforeEach(function() {
              setupHandlerAndSubject("completed", function(req, res) {
                res.say(req.getDialog().isStarted() ? "yes" : "no");
                return true;
              });
            });

            it("reports dialogState is not STARTED", function() {
              return expect(subject).to.eventually.become({
                ssml: "<speak>no</speak>",
                type: "SSML"
              });
            });
          });
        });

        describe("#isInProgress", function() {
          context("when an intent's dialogState is IN_PROGRESS", function() {
            beforeEach(function() {
              setupHandlerAndSubject("in_progress", function(req, res) {
                res.say(req.getDialog().isInProgress() ? "yes" : "no");
                return true;
              });
            });

            it("reports dialogState is IN_PROGRESS", function() {
              return expect(subject).to.eventually.become({
                ssml: "<speak>yes</speak>",
                type: "SSML"
              });
            });
          });

          context("when an intent's dialogState is not IN_PROGRESS", function() {
            beforeEach(function() {
              setupHandlerAndSubject("completed", function(req, res) {
                res.say(req.getDialog().isInProgress() ? "yes" : "no");
                return true;
              });
            });

            it("reports dialogState is not IN_PROGRESS", function() {
              return expect(subject).to.eventually.become({
                ssml: "<speak>no</speak>",
                type: "SSML"
              });
            });
          });
        });

        describe("#isCompleted", function() {
          context("when an intent's dialogState is COMPLETED", function() {
            beforeEach(function() {
              setupHandlerAndSubject("completed", function(req, res) {
                res.say(req.getDialog().isCompleted() ? "yes" : "no");
                return true;
              });
            });

            it("reports dialogState is COMPLETED", function() {
              return expect(subject).to.eventually.become({
                ssml: "<speak>yes</speak>",
                type: "SSML"
              });
            });
          });

          context("when an intent's dialogState is not COMPLETED", function() {
            beforeEach(function() {
              setupHandlerAndSubject("started", function(req, res) {
                res.say(req.getDialog().isCompleted() ? "yes" : "no");
                return true;
              });
            });

            it("reports dialogState is not COMPLETED", function() {
              return expect(subject).to.eventually.become({
                ssml: "<speak>no</speak>",
                type: "SSML"
              });
            });
          });
        });
      });

      describe("dialog response", function() {
        context("request's intent has a dialogState of STARTED", function() {
          var mockRequest = mockHelper.load("intent_request_food_delivery_dialog_started.json");
          var dialogDirective = {
            type: 'Dialog.Delegate'
          };

          context("intent configured to delegate dialog to Alexa", function() {
            beforeEach(function() {
              app.intent("deliveryCreationRequest", {
                "dialog": {
                  type: "delegate"
                }
              }, function(req, res) {
                res.say("I'm starting your delivery").send();
                return true;
              });
            });

            it("contains directive property with Dialog.Delegate directive object", function() {
              var subject = app.request(mockRequest).then(function(response) {
                return response.response.directives;
              });
              return expect(subject).to.eventually.contain(dialogDirective);
            });

            it("does not utilize intent's intentHandler", function() {
              var subject = app.request(mockRequest).then(function(response) {
                return response.response.outputSpeech;
              });
              return expect(subject).to.not.eventually.become({
                ssml: "<speak>I'm starting your delivery</speak>",
                type: "SSML"
              });
            });
          });

          context("intent is manually handling the dialog", function() {
            beforeEach(function() {
              app.intent("deliveryCreationRequest", {}, function(req, res) {
                res.say("I'm starting your delivery").send();
                return true;
              });
            });

            it("contains no directive properties", function() {
              var subject = app.request(mockRequest).then(function(response) {
                return response.response.directives;
              });
              return expect(subject).to.eventually.be.empty;
            });

            it("utilizes intent's intentHandler", function() {
              var subject = app.request(mockRequest).then(function(response) {
                return response.response.outputSpeech;
              });
              return expect(subject).to.eventually.become({
                ssml: "<speak>I'm starting your delivery</speak>",
                type: "SSML"
              });
            });
          });
        });

        context("request's intent has a dialogState of IN_PROGRESS", function() {
          var mockRequest = mockHelper.load("intent_request_food_delivery_dialog_in_progress.json");
          var dialogDirective = {
            type: 'Dialog.Delegate'
          };

          context("intent configured to delegate dialog to Alexa", function() {
            beforeEach(function() {
              app.intent("deliveryCreationRequest", {
                "dialog": {
                  type: "delegate"
                }
              }, function(req, res) {
                res.say("I'm starting your delivery").send();
                return true;
              });
            });

            it("contains directive property with Dialog.Delegate directive object", function() {
              var subject = app.request(mockRequest).then(function(response) {
                return response.response.directives;
              });
              return expect(subject).to.eventually.contain(dialogDirective);
            });

            it("does not utilize intent's intentHandler", function() {
              var subject = app.request(mockRequest).then(function(response) {
                return response.response.outputSpeech;
              });
              return expect(subject).to.not.eventually.become({
                ssml: "<speak>I'm starting your delivery</speak>",
                type: "SSML"
              });
            });
          });

          context("intent is manually handling the dialog", function() {
            beforeEach(function() {
              app.intent("deliveryCreationRequest", {}, function(req, res) {
                res.say("I'm starting your delivery").send();
                return true;
              });
            });

            it("contains no directive properties", function() {
              var subject = app.request(mockRequest).then(function(response) {
                return response.response.directives;
              });
              return expect(subject).to.eventually.be.empty;
            });

            it("utilizes intent's intentHandler", function() {
              var subject = app.request(mockRequest).then(function(response) {
                return response.response.outputSpeech;
              });
              return expect(subject).to.eventually.become({
                ssml: "<speak>I'm starting your delivery</speak>",
                type: "SSML"
              });
            });
          });
        });

        context("request's intent has a dialogState of COMPLETED", function() {
          var mockRequest = mockHelper.load("intent_request_food_delivery_dialog_completed.json");
          var dialogDirective = {
            type: 'Dialog.Delegate'
          };

          context("intent configured to delegate dialog to Alexa", function() {
            beforeEach(function() {
              app.intent("deliveryCreationRequest", {
                "dialog": {
                  type: "delegate"
                }
              }, function(req, res) {
                res.say("I'm starting your delivery").send();
                return true;
              });
            });

            it("contains no directive properties", function() {
              var subject = app.request(mockRequest).then(function(response) {
                return response.response.directives;
              });
              return expect(subject).to.eventually.be.empty;
            });

            it("utilizes intent's intentHandler", function() {
              var subject = app.request(mockRequest).then(function(response) {
                return response.response.outputSpeech;
              });
              return expect(subject).to.eventually.become({
                ssml: "<speak>I'm starting your delivery</speak>",
                type: "SSML"
              });
            });
          });

          context("intent is manually handling the dialog", function() {
            beforeEach(function() {
              app.intent("deliveryCreationRequest", {}, function(req, res) {
                res.say("I'm starting your delivery").send();
                return true;
              });
            });

            it("contains no directive properties", function() {
              var subject = app.request(mockRequest).then(function(response) {
                return response.response.directives;
              });
              return expect(subject).to.eventually.be.empty;
            });

            it("utilizes intent's intentHandler", function() {
              var subject = app.request(mockRequest).then(function(response) {
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
