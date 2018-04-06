/*jshint expr: true*/
"use strict";
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;
chai.config.includeStack = true;

describe("Alexa", function() {
  var Alexa = require("../index");

  describe("app", function() {
    describe("instantiate app", function() {
      it("fails when alexa.app was called without the new keyword", function() {
        var message;

        try {
          var testApp = Alexa.app("testApp");
        } catch (e) {
          message = e.message;
        }

        return expect(Promise.resolve(message))
          .to.eventually.equal("Function must be called with the new keyword");
      });
    });
  });
});
