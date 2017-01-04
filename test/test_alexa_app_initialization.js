/*jshint expr: true*/
"use strict";
var fs = require("fs");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;
var AlexaApp = require("../index");
chai.config.includeStack = true;

describe("Alexa", function() {
  var Alexa = require("../index");

  describe("app", function() {
    var testApp;
    beforeEach(() => {
      testApp = new Alexa.app("testApp");
    });

    describe("initialization", function() {
      describe("defaults", function() {
        it("sets persistent session to true", function() {
          return expect(testApp.persistentSession).to.eq(true);
        });

        it("sets exhaustiveUtterances to false", function() {
          return expect(testApp.exhaustiveUtterances).to.eq(false);
        });
      });

      it("sets the name of the app", function() {
        return expect(testApp.name).to.eq("testApp");
      });

      it("adds to alexa.apps", function() {
        return expect(Alexa.apps["testApp"]).to.eq(testApp);
      });
    });
  });
});
