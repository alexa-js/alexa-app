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

    describe("#schema", function() {
      beforeEach(() => {
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
        var expected = JSON.stringify(mockHelper.load("expected_intent_schema.json"));
        var subject = JSON.stringify(JSON.parse(testApp.schema()));
        expect(subject).to.eq(expected);
      });
    });
  });
});
