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

    context("#intent", function() {
      context("with schema", function() {
        var schema = {};

        beforeEach(function() {
          testApp.intent("airportInfoIntent", schema, function() {});
        });

        it("assigns handler", function() {
          expect(testApp.intents["airportInfoIntent"].handler).to.exist;
        });

        it("assigns name", function() {
          expect(testApp.intents["airportInfoIntent"].name).to.equal("airportInfoIntent");
        });

        context("dialog", function() {
          var dialog = {
            type: "delegate"
          };
          schema = {
            dialog: dialog
          }

          it("assigns dialog", function() {
            expect(testApp.intents["airportInfoIntent"].dialog).to.equal(dialog);
          });
        });
      });

      context("without schema", function() {
        beforeEach(function() {
          testApp.intent("airportInfoIntent", function() {});
        });

        it("assigns handler", function() {
          expect(testApp.intents["airportInfoIntent"].handler).to.exist;
        });

        it("assigns name", function() {
          expect(testApp.intents["airportInfoIntent"].name).to.equal("airportInfoIntent");
        });
      });
    });
  });
});
