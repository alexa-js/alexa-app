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
    var testApp;
    beforeEach(function() {
      testApp = new Alexa.app("testApp");
    });

    context("#intent", function() {
      var func = function(req, res) { };

      context("with schema", function() {
        var schema = { schema: "yes" };

        beforeEach(function() {
          testApp.intent("airportInfoIntent", schema, func);
        });

        it("assigns handler", function() {
          expect(testApp.intents["airportInfoIntent"].handler).to.equal(func);
        });

        it("assigns name", function() {
          expect(testApp.intents["airportInfoIntent"].name).to.equal("airportInfoIntent");
        });

        context("dialogue", function(){
          var dialogue = { type: "delegate" };
          schema = { dialogue: dialogue }

          it("assigns dialogue", function() {
            expect(testApp.intents["airportInfoIntent"].dialogue).to.equal(dialogue);
          });
        });
      });

      context("without schema", function() {
        beforeEach(function() {
          testApp.intent("airportInfoIntent", func);
        });

        it("assigns handler", function() {
          expect(testApp.intents["airportInfoIntent"].handler).to.equal(func);
        });

        it("assigns name", function() {
          expect(testApp.intents["airportInfoIntent"].name).to.equal("airportInfoIntent");
        });
      });
    });
  });
});
