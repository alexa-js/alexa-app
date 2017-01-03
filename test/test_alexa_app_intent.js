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
    beforeEach(() => {
      testApp = new Alexa.app("testApp");
    });

    context("#intent", function() {
      var func = function(req, res) { };

      context("with schema", function() {
        var schema = { schema: "yes" };

        beforeEach(() => {
          testApp.intent("airportInfoIntent", schema, func);
        });

        it("assigns schema", function() {
          expect(testApp.intents["airportInfoIntent"].schema).to.equal(schema);
        });

        it("assigns function", function() {
          expect(testApp.intents["airportInfoIntent"].function).to.equal(func);
        });

        it("assigns name", function() {
          expect(testApp.intents["airportInfoIntent"].name).to.equal("airportInfoIntent");
        });
      });

      context("without schema", function() {
        beforeEach(() => {
          testApp.intent("airportInfoIntent", func);
        });

        it("doesn't assign schema", function() {
          expect(testApp.intents["airportInfoIntent"].schema).to.be.undefined;
        });

        it("assigns function", function() {
          expect(testApp.intents["airportInfoIntent"].function).to.equal(func);
        });

        it("assigns name", function() {
          expect(testApp.intents["airportInfoIntent"].name).to.equal("airportInfoIntent");
        });
      });
    });
  });
});
