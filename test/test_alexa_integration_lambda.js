/*jshint expr: true*/
"use strict";
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
var expect = chai.expect;
chai.config.includeStack = true;
var mockHelper = require("./helpers/mock_helper");
var sinon = require("sinon");

describe("Alexa", function() {
  var Alexa = require("../index");

  describe("app", function() {
    var testApp;
    beforeEach(function() {
      testApp = new Alexa.app("testApp");
    });

    describe("#handler", function() {
      it("calls context.succeed on success", function(done) {
        var mockRequest = mockHelper.load("intent_request_airport_info.json");

        var context = {};

        var callback = function(error, response) {
            expect(error).to.be.null;
            expect(response.version).to.equal("1.0");
            done();
        };

        testApp.handler(mockRequest, context, callback);
      });

      it("calls context.fail on error", function(done) {
        var context = {};

        var callback = function(error) {
            // TypeError: context.succeed is not a function
            expect(error).to.be.an.instanceof(Error);
            done();
        };

        testApp.handler({}, context, callback);
      });
    });

    describe("#lambda", function() {
      it("returns the default handler", function() {
        expect(testApp.lambda()).to.equal(testApp.handler);
      });
    });
  });
});
