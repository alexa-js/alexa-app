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

    describe("#schema", function() {
      describe("with a minimum intent", function() {
        beforeEach(function() {
          testApp.intent("AMAZON.PauseIntent");
        });

        it("contains no slots", function() {
          var subject = JSON.parse(testApp.schema());
          expect(subject).to.eql({
            "intents": [{
              "intent": "AMAZON.PauseIntent"
            }]
          });
        });
      });

      describe("with empty slots", function() {
        beforeEach(function() {
          testApp.intent("AMAZON.PauseIntent", {
            "slots": {}
          });
        });

        it("contains no slots", function() {
          var subject = JSON.parse(testApp.schema());
          expect(subject).to.eql({
            "intents": [{
              "intent": "AMAZON.PauseIntent"
            }]
          });
        });
      });

      describe("with a slot", function() {
        beforeEach(function() {
          testApp.intent("testIntent", {
            "slots": {
              "MyCustomSlotType": "CUSTOMTYPE",
              "Tubular": "AMAZON.LITERAL",
              "Radical": "AMAZON.US_STATE",
            },
          });
        });

        it("includes slots", function() {
          var subject = JSON.parse(testApp.schema());
          expect(subject).to.eql({
            "intents": [{
              "intent": "testIntent",
              "slots": [{
                "name": "MyCustomSlotType",
                "type": "CUSTOMTYPE"
              }, {
                "name": "Tubular",
                "type": "AMAZON.LITERAL"
              }, {
                "name": "Radical",
                "type": "AMAZON.US_STATE"
              }]
            }]
          });
        });
      });

      describe("with multiple intents", function() {
        beforeEach(function() {
          testApp.intent("AMAZON.PauseIntent");

          testApp.intent("testIntentTwo", {
            "slots": {
              "MyCustomSlotType": "CUSTOMTYPE",
              "Tubular": "AMAZON.LITERAL",
              "Radical": "AMAZON.US_STATE",
            },
          });

          testApp.intent("testIntent", {
            "slots": {
              "AirportCode": "FAACODES",
              "Awesome": "AMAZON.DATE",
              "Tubular": "AMAZON.LITERAL"
            },
          });
        });

        it("generates the expected schema", function() {
          var subject = JSON.parse(testApp.schema());
          expect(subject).to.eql({
            "intents": [{
              "intent": "AMAZON.PauseIntent",
            }, {
              "intent": "testIntentTwo",
              "slots": [{
                "name": "MyCustomSlotType",
                "type": "CUSTOMTYPE"
              }, {
                "name": "Tubular",
                "type": "AMAZON.LITERAL"
              }, {
                "name": "Radical",
                "type": "AMAZON.US_STATE"
              }]
            }, {
              "intent": "testIntent",
              "slots": [{
                "name": "AirportCode",
                "type": "FAACODES"
              }, {
                "name": "Awesome",
                "type": "AMAZON.DATE"
              }, {
                "name": "Tubular",
                "type": "AMAZON.LITERAL"
              }]
            }]
          });
        });
      });
    });
  });
});
