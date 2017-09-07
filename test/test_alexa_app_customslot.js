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

    context("#customslot", function() {
      var slotValue = {
        value: "dog",
        synonyms: ["pupper, doggo"],
        id: "dog"
      };

      context("with a complete slot value object", function() {
        beforeEach(function() {
          testApp.customSlot("animals", [slotValue]);
        });

        it("adds the slot value", function() {
          expect(testApp.customSlots["animals"]).to.eql([slotValue]);
        });
      });

      context("with an incomplete slot value object", function() {
        beforeEach(function() {
          testApp.customSlot("animals", [{value: "dog"}]);
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
          }, slotValue]);
        });
      });
    });
  });
});