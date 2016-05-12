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
    describe("#schema", function() {
      var app = new Alexa.app("myapp");
      app.intent("testIntentTwo", {
        "slots": {
          "MyCustomSlotType": "CUSTOMTYPE",
          "Tubular": "AMAZON.LITERAL",
          "Radical": "AMAZON.US_STATE",
        },
      });
      app.intent("testIntent", {
        "slots": {
          "AirportCode": "FAACODES",
          "Awesome": "AMAZON.DATE",
          "Tubular": "AMAZON.LITERAL"
        },
      });
      var expected = JSON.stringify(mockHelper.load("expected_intent_schema.json"));
      var subject = JSON.stringify(JSON.parse(app.schema()));
      it("generates the expected schema", function() {
        expect(subject).to.eq(expected);
      });
    });
  });
});
