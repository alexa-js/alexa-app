/*jshint expr: true*/
"use strict";
var fs = require("fs");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;
chai.config.includeStack = true;

import * as Alexa from '..'

describe("Alexa", function() {
  describe("app", function() {
    var testApp = new Alexa.app("testApp");

    beforeEach(function() {
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

  describe("app without a name", function() {
    const CleanAlexaApp = require('../');
    var testApp;

    beforeEach(function() {
      CleanAlexaApp.apps = {};
      testApp = new CleanAlexaApp.app();
    })

    it("doesn't add the app to alexa.apps", function() {
      return expect(Object.keys(CleanAlexaApp.apps).length).to.eq(0);
    });
  });
});
