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

  context("#alexa.request.slot", function() {
    var testReq = mockHelper.load("intent_request_airport_info.json");

    beforeEach(function() {
      testReq = mockHelper.load("intent_request_airport_info.json");
    });

    afterEach(() => {
      testReq = null;
    });

    it("get slot value if correct", function() {
      var req = new Alexa.request(testReq);
      expect(req.slot("AirportCode", "SEA")).to.eql("JFK");
    });

    it("gets defaultValue if slot value is undefined", function() {
      testReq.request.intent.slots.AirportCode.value = undefined;
      var req = new Alexa.request(testReq);
      expect(req.slot("AirportCode", "SEA")).to.eql("SEA");
    });
  });

  describe("app", function() {
    var testApp = new Alexa.app("testApp");

    beforeEach(function() {
      testApp = new Alexa.app("testApp");
    });

    context("#customslot", function() {
      var slotValue = {
        value: "dog",
        synonyms: ["doggo", "pup{per|}"],
        id: "dog"
      };
      var slotValueExpanded = {
        value: "dog",
        synonyms: ["doggo", "pupper", "pup"],
        id: "dog"
      };

      context("with a complete slot value object", function() {
        beforeEach(function() {
          testApp.customSlot("animals", [slotValue]);
        });

        it("adds the slot value", function() {
          expect(testApp.customSlots["animals"]).to.eql([slotValueExpanded]);
        });
      });

      context("with an incomplete slot value object", function() {
        beforeEach(function() {
          testApp.customSlot("animals", [{
            value: "dog"
          }]);
        });

        it("adds the slot value with default params", function() {
          expect(testApp.customSlots["animals"]).to.eql([{
            value: "dog",
            synonyms: [],
            id: null
          }]);
        });
      });

      context("with strings", function() {
        beforeEach(function() {
          testApp.customSlot("animals", ["dog"]);
        });

        it("converts the string into a slot value", function() {
          expect(testApp.customSlots["animals"]).to.eql([{
            value: "dog",
            synonyms: [],
            id: null
          }]);
        });
      });

      context("with a mix of strings and objects", function() {
        beforeEach(function() {
          testApp.customSlot("animals", ["dog", slotValue]);
        });

        it("assigns both properly", function() {
          expect(testApp.customSlots["animals"]).to.eql([{
            value: "dog",
            synonyms: [],
            id: null
          }, slotValueExpanded]);
        });
      });
    });
  });
});
