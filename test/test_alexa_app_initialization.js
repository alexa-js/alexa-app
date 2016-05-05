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
    var app = new Alexa.app("myapp");
    describe("initialization", function() {
      describe("defaults", function() {
        it("sets persistent session to true", function() {
          return expect(app.persistentSession).to.eq(true);
        });
        it("sets exhaustiveUtterances to false", function() {
          return expect(app.exhaustiveUtterances).to.eq(false);
        });
      });
      it("sets the name of the app to expected", function() {
        return expect(app.name).to.eq("myapp");
      });
    });
  });
});
