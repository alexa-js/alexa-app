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
    var app = new Alexa.app("myapp");

    describe("#request", function() {
      describe("directives response", function() {
        context("alexa directive response", function() {
          var mockRequest = mockHelper.load("intent_audioplayer.json");
          var customDirective = {
            type: 'Custom.Directive',
            instructions: {
              type: 'special',
            }
          };

          it("contains directive property with custom object", function() {
            app.intent("audioPlayerIntent", {}, function(req, res) {
              res.directive(customDirective);
              return true;
            });

            var subject = app.request(mockRequest).then(function(response) {
              return response.response.directives;
            });
            return expect(subject).to.eventually.contain(customDirective);
          });

          it("clears directive property when clear is called", function() {
            app.intent("audioPlayerIntent", {}, function(req, res) {
              res.directive(customDirective).getDirectives().clear();
              return true;
            });

            var subject = app.request(mockRequest).then(function(response) {
              return response.response.directives;
            });

            return expect(subject).to.eventually.become([]);
          });
        });
      });
    });
  });
});
