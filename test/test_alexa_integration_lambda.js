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
    beforeEach(() => {
      testApp = new Alexa.app("testApp");
    });

    describe("#handler", function() {
      it("calls context.succeed on success", function(done) {
        var mockRequest = mockHelper.load("intent_request_airport_info.json");

        var context = {
          succeed: function(response) {
            expect(response.version).to.equal("1.0");
            done();
          },
          fail: function(response) {}
        };

        testApp.handler(mockRequest, context);
      });

      it("calls context.fail on error", function(done) {
        var context = {
          fail: function(response) {
            // TypeError: context.succeed is not a function
            expect(response).to.be.an.instanceof(TypeError);
            done();
          }
        };

        testApp.handler({}, context);
      });
    });

    describe("#lambda", function() {
      it("returns the default handler", function() {
        expect(testApp.lambda()).to.equal(testApp.handler);
      });
    });
  });
});
